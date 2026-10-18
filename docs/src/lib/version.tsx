import React from 'react';
import rootPkg from '../../../package.json';
import utilPkg from '../../../packages/@strafe-js/util/package.json';
import collectionPkg from '../../../packages/@strafe-js/collection/package.json';
import formattersPkg from '../../../packages/@strafe-js/formatters/package.json';
import buildersPkg from '../../../packages/@strafe-js/builders/package.json';
import restPkg from '../../../packages/@strafe-js/rest/package.json';
import wsPkg from '../../../packages/@strafe-js/ws/package.json';
import strafebotPkg from '../../../packages/strafebot/package.json';
import createStrafebotPkg from '../../../packages/create-strafe-bot/package.json';

export const SDK_VERSION: string = rootPkg.version;
export const SDK_VERSION_TAG = `v${SDK_VERSION}`;

export const PACKAGE_VERSIONS: Record<string, string> = {
  '@strafe-js/util': utilPkg.version,
  '@strafe-js/collection': collectionPkg.version,
  '@strafe-js/formatters': formattersPkg.version,
  '@strafe-js/builders': buildersPkg.version,
  '@strafe-js/rest': restPkg.version,
  '@strafe-js/ws': wsPkg.version,
  '@strafe-js/strafebot': strafebotPkg.version,
  'create-strafebot': createStrafebotPkg.version,
};

export function SdkVersion({
  pkg,
  prefix = '',
  code = false,
}: {
  pkg?: string;
  prefix?: string;
  code?: boolean;
}) {
  const ver = (pkg && PACKAGE_VERSIONS[pkg]) || SDK_VERSION;
  const text = `${prefix}${ver}`;
  if (code) {
    return <code>{text}</code>;
  }
  return <>{text}</>;
}
