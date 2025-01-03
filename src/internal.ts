import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';

import type { ResolvedConfig } from 'vite';

type ReducedResolvedConfig = Pick<ResolvedConfig, 'root' | 'publicDir'>;

type Paths = {
    filenameWithoutTexExtension: string;
    tmpDirPath: string;
    fileOriginPath: string;
    dirDestPath: string;
    fileDestPath: string;
    uri: string;
};

export type viteTexLoaderOptions = {
    /**
     * Path to GhostScript lib (not executable)
     */
    LIBGS?: string;
};

function hasStdout(e: unknown): e is { stdout: ArrayBuffer } {
    return (e instanceof Object || typeof e === 'object') && e !== null &&
        Object.hasOwn(e, 'stdout');
}

function readContent(filename: string) {
    return fs.readFileSync(filename).toString();
}

function getPaths(
    config: ReducedResolvedConfig,
    fileOriginPath: string,
    fileExtension: string,
): Paths {
    const dirPath = path.dirname(fileOriginPath);
    const filename = path.basename(fileOriginPath);
    const relativeFolderPath = dirPath.replace(
        path.normalize(`${config.root}/`),
        '',
    );
    const fileExtensionMatch = filename.match(/^(.*)\.tex$/);
    if (!fileExtensionMatch) {
        throw new Error('The file is not a .tex file.');
    }
    const filenameWithoutTexExtension = fileExtensionMatch[1] as string;
    const viteTexLoaderTmpDirPath = `${config.root}/.vite-tex-loader`;
    const tmpDirPath = `${viteTexLoaderTmpDirPath}/${
        dirPath.replace(config.root, '')
    }`;
    const dirDestPath =
        `${config.publicDir}/.auto-generated/${relativeFolderPath}`;
    const fileDestPath =
        `${dirDestPath}/${filenameWithoutTexExtension}.${fileExtension}`;
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
        if (modifiedDateOrigin <= modifiedDateDest) {
            // No need to regenerate the file
            return false;
        }
    } catch (_) {
        // statSync didn't work on the file => it does not exist, we consider it is outdated
    }
    return true;
}

function findGhostScript(libgs?: string) {
    if (libgs !== undefined) {
        return libgs;
    }

    try {
        let path = '/usr/local/share/ghostscript';
        let children = fs.readdirSync(path);
        path = `${path}/${children[children.length - 1]}/lib`;
        children = fs.readdirSync(path);
        const lib = children.find((f) =>
            f.startsWith('libgs.so') || f.startsWith('libgs.dylib')
        );
        return `${path}/${lib}`;
    } catch (e) {
        console.info('Ghostscript could not be found', e);
        return libgs;
    }
}

function handleTexToSvg(
    options: viteTexLoaderOptions,
    config: ReducedResolvedConfig,
    filePath: string,
): string | undefined {
    const paths = getPaths(config, filePath, 'svg');
    if (newVersion(paths.fileOriginPath, paths.fileDestPath)) {
        try {
            const libgsPath = findGhostScript(options.LIBGS);
            const libgs = libgsPath ? `export LIBGS=${libgsPath};` : '';
            const cmd = [
                `mkdir -p "${paths.tmpDirPath}"`,
                `mkdir -p "${paths.dirDestPath}"`,
                `latex -output-directory="${paths.tmpDirPath}" -output-format=dvi "${paths.fileOriginPath}"`,
                `dvisvgm -o "${paths.fileDestPath}" "${paths.tmpDirPath}/${paths.filenameWithoutTexExtension}.dvi"`,
            ].join(' && ');
            childProcess.execSync(`${libgs} ${cmd}`);
        } catch (e) {
            let stdout: string = '';
            if (hasStdout(e)) {
                stdout = e.stdout.toString();
            }
            throw new Error(
                `Couldn't convert "${paths.fileOriginPath}" to SVG: ${stdout}`,
            );
        }
    }

    return `export const uri = "/${paths.uri}"; export const raw = \`${
        readContent(paths.fileDestPath)
    }\`; export default uri;`;
}

function handleTexToPdf(
    options: viteTexLoaderOptions,
    config: ReducedResolvedConfig,
    filePath: string,
): string | undefined {
    const paths = getPaths(config, filePath, 'pdf');
    if (newVersion(paths.fileOriginPath, paths.fileDestPath)) {
        try {
            const libgsPath = findGhostScript(options.LIBGS);
            const libgs = libgsPath ? `export LIBGS=${libgsPath};` : '';
            const cmd = [
                `mkdir -p "${paths.tmpDirPath}"`,
                `mkdir -p "${paths.dirDestPath}"`,
                `pdflatex -output-directory="${paths.tmpDirPath}" "${paths.fileOriginPath}"`,
                `mv "${paths.tmpDirPath}/${paths.filenameWithoutTexExtension}.pdf" "${paths.fileDestPath}"`,
            ].join(' && ');
            childProcess.execSync(`${libgs} ${cmd}`);
        } catch (e) {
            let error: string = '';
            if (hasStdout(e)) {
                error = e.stdout.toString();
            }
            throw new Error(
                `Couldn't convert "${paths.fileOriginPath}" to PDF: ${error}`,
            );
        }
    }

    return `export default "/${paths.uri}";`;
}

export function load(
    options: viteTexLoaderOptions,
    config: ReducedResolvedConfig,
    filePath: string,
) {
    // Give priority to the options, otherwise use the env variable
    if (options.LIBGS === undefined && process.env.LIBGS) {
        options.LIBGS = process.env.LIBGS;
    }

    if (filePath.match(/.+\.tex\?svg$/)) {
        return handleTexToSvg(options, config, filePath.replace(/\?svg$/, ''));
    }
    if (filePath.match(/.+\.tex\?pdf-uri$/)) {
        return handleTexToPdf(
            options,
            config,
            filePath.replace(/\?pdf-uri$/, ''),
        );
    }
    // We don't support the file/module requested
    return undefined;
}
