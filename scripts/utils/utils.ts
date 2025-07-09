import { Version } from "../config";

export function parseVersion(versionStr: string): Version {
    const [major = 0, minor = 0, patch = 0] = versionStr.split('.').map(Number)
    return { major, minor, patch }
}

export function formatVersion(version: Version): string {
    return `${version.major}.${version.minor}.${version.patch}`
}

export function compareVersions(a: Version, b: Version): number {
    if (a.major !== b.major) return b.major - a.major
    if (a.minor !== b.minor) return b.minor - a.minor
    return b.patch - a.patch
}