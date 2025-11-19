import { Version } from "../config";

export function parseVersion(versionStr: string): Version {
    const parts = versionStr.split('.').map(Number)
    const [major = 0, minor = 0, patch = 0, hotfix = undefined] = parts
    return { major, minor, patch, hotfix }
}

export function formatVersion(version: Version): string {
    if (version.hotfix !== undefined) {
        return `${version.major}.${version.minor}.${version.patch}.${version.hotfix}`
    }
    return `${version.major}.${version.minor}.${version.patch}`
}

export function compareVersions(a: Version, b: Version): number {
    if (a.major !== b.major) return b.major - a.major
    if (a.minor !== b.minor) return b.minor - a.minor
    if (a.patch !== b.patch) return b.patch - a.patch
    // Compare hotfix if both have it, otherwise version without hotfix is considered newer
    const aHotfix = a.hotfix ?? 0
    const bHotfix = b.hotfix ?? 0
    return bHotfix - aHotfix
}

export interface SubgraphInfo {
    name: string;
    version: string;
}

export function extractSubgraphInfo(url: string): SubgraphInfo {
    try {
        // Extract the part after "subgraphs/"
        const match = url.match(/\/subgraphs\/([^\/]+)\/([^\/]+)/);
        if (!match) throw new Error('Invalid URL')

        return {
            name: match[1] || '',
            version: match[2] || ''
        };
    } catch (error) {
        console.error('Error extracting subgraph info: ', error)
        throw error
    }
}