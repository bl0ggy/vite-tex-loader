import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';

import type { ResolvedConfig } from 'vite';

type Paths = {
    filenameWithoutTexExtension: string
    tmpDirPath: string
    fileOriginPath: string
    dirDestPath: string
    fileDestPath: string
    uri: string
}

export type viteTexLoaderOptions = {
    /**
     * Path to GhostScript lib (not executable)
     */
    LIBGS?: string;
}

function readContent(filename: string) {
    return fs.readFileSync(filename)
    .toString();
}

function getPaths(config: ResolvedConfig, fileOriginPath: string, fileExtension: string) : Paths {
    const dirPath = path.dirname(fileOriginPath);
    const filename = path.basename(fileOriginPath);
    const relativeFolderPath = dirPath.replace(path.normalize(`${config.root}/`), '');
    const fileExtensionMatch = filename.match(/^(.*)\.tex$/);
    if(!fileExtensionMatch) {
        throw new Error('The file is not a .tex file.');
    }
    const filenameWithoutTexExtension = fileExtensionMatch[1] as string;
    const viteTexLoaderTmpDirPath = `${config.root}/.vite-tex-loader`;
    const tmpDirPath = `${viteTexLoaderTmpDirPath}/${dirPath.replace(config.root, '')}`;
    const dirDestPath = `${config.publicDir}/.auto-generated/${relativeFolderPath}`;
    const fileDestPath = `${dirDestPath}/${filenameWithoutTexExtension}.${fileExtension}`;
    const uri = fileDestPath.replace(`${config.root}/public/`, '');
    return {
        filenameWithoutTexExtension,
        tmpDirPath,
        fileOriginPath,
        dirDestPath,
        fileDestPath,
        uri,
    };
}

function newVersion(fileOriginPath: string, fileDestPath: string) {
    try {
        const statTex = fs.statSync(fileOriginPath);
        const statPdf = fs.statSync(fileDestPath);
        const modifiedDateOrigin = statTex.mtime;
        const modifiedDateDest = statPdf.mtime;
        if(modifiedDateOrigin <= modifiedDateDest) {
            // No need to regenerate the file
            return false;
        }
    } catch (exception) {
        // statSync didn't work on the file => it does not exist, we consider it is outdated
    }
    return true;
}

export function handleTexToSvg(options: viteTexLoaderOptions, config: ResolvedConfig, filePath: string) : string | undefined {
    const paths = getPaths(config, filePath, 'svg');
    if(newVersion(paths.fileOriginPath, paths.fileDestPath)) {
        try {
            const libgs = options.LIBGS ? `export LIBGS=${options.LIBGS};` : '';
            const cmd = `${libgs} mkdir -p "${paths.tmpDirPath}" && mkdir -p "${paths.dirDestPath}" && latex -output-directory="${paths.tmpDirPath}" -output-format=dvi "${paths.fileOriginPath}" && dvisvgm -o "${paths.fileDestPath}" "${paths.tmpDirPath}/${paths.filenameWithoutTexExtension}.dvi"`;
            childProcess.execSync(cmd);
        } catch (e) {
            throw new Error(`Couldn't convert "${paths.fileOriginPath}" to SVG`);
        }
    }

    return `export const uri = "/${paths.uri}"; export const raw = \`${readContent(paths.fileDestPath)}\`; export default uri;`;
}

export function handleTexToPdf(options: viteTexLoaderOptions, config: ResolvedConfig, filePath: string) : string | undefined {
    const paths = getPaths(config, filePath, 'pdf');
    if(newVersion(paths.fileOriginPath, paths.fileDestPath)) {
        try {
            const libgs = options.LIBGS ? `export LIBGS=${options.LIBGS};` : '';
            const cmd = `${libgs} mkdir -p "${paths.tmpDirPath}" && mkdir -p "${paths.dirDestPath}" && pdflatex -output-directory="${paths.tmpDirPath}" "${paths.fileOriginPath}" && mv "${paths.tmpDirPath}/${paths.filenameWithoutTexExtension}.pdf" "${paths.fileDestPath}"`;
            childProcess.execSync(cmd);
        } catch (e) {
            throw new Error(`Couldn't convert "${paths.fileOriginPath}" to PDF`);
        }
    }

    return `export default "/${paths.uri}";`;
}
