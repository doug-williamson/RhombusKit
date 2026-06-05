# Changelog

## [1.0.0](https://github.com/doug-williamson/RhombusKit/compare/v0.11.0...v1.0.0) (2026-06-05)


### Features

* **showcase:** add a homepage at / ([9e7b6d3](https://github.com/doug-williamson/RhombusKit/commit/9e7b6d3ffb7375ffb10c0db4ca6177fce7ba46de))
* **showcase:** add an interactive theming guide at /theming ([288678c](https://github.com/doug-williamson/RhombusKit/commit/288678c13d844ea43f6e5df22aacb2896ec68cca))
* **showcase:** add deep-linkable component-page tab shell ([d0091c3](https://github.com/doug-williamson/RhombusKit/commit/d0091c396050684d583d2f403b5f42f4d33e5bec))
* **showcase:** generate API metadata from the type surface ([f6a6c63](https://github.com/doug-williamson/RhombusKit/commit/f6a6c63008f29690fba52c8daeac9f2aee545c61))
* **showcase:** homepage, deep-linkable Overview/API/Examples tabs, generated API reference + theming guide ([0bf3523](https://github.com/doug-williamson/RhombusKit/commit/0bf3523f74c972f2999b2637ee51fe6d4fb73631))
* **showcase:** refactor all component pages into the tab shell ([510fe68](https://github.com/doug-williamson/RhombusKit/commit/510fe68eb245b10ec9d62760bdb8902af028f637))
* **showcase:** render the API tab from generated metadata ([2a48543](https://github.com/doug-williamson/RhombusKit/commit/2a48543accf843cecd6f79367ee96a091a59ff12))


### Bug Fixes

* **showcase:** add highlight.js so the code-block page works in dev ([e44cc92](https://github.com/doug-williamson/RhombusKit/commit/e44cc92042e7d3330bf1bd2791b7dd645bf10c0e))


### Miscellaneous Chores

* release RhombusKit 1.0.0 ([959528e](https://github.com/doug-williamson/RhombusKit/commit/959528ea5018353bb487b87137a3694e11a28f3b))
* release RhombusKit 1.0.0 ([#50](https://github.com/doug-williamson/RhombusKit/issues/50)) ([3c98a36](https://github.com/doug-williamson/RhombusKit/commit/3c98a361a41f07137a1ba7675c55031b7566c028))

## [0.11.0](https://github.com/doug-williamson/RhombusKit/compare/v0.10.0...v0.11.0) (2026-06-04)


### Features

* **a11y:** WCAG 2.1 AA color-contrast gate + default-theme fixes (Phase 4) ([d366797](https://github.com/doug-williamson/RhombusKit/commit/d3667979e055d61b425513d9a05c255c89338331))


### Bug Fixes

* **tokens:** meet WCAG 2.1 AA contrast in the default themes ([ee64d10](https://github.com/doug-williamson/RhombusKit/commit/ee64d10e6c4d624a7a9d8163c31190b044e2c5b6))

## [0.10.0](https://github.com/doug-williamson/RhombusKit/compare/v0.9.0...v0.10.0) (2026-06-04)


### Features

* **core:** add alert component ([defa95a](https://github.com/doug-williamson/RhombusKit/commit/defa95a130a0dc360d041ee32d524bd023f318a4))
* **core:** add avatar component ([21b337b](https://github.com/doug-williamson/RhombusKit/commit/21b337b377e0d9c0fc6b07c591f60b09c40318f1))
* **core:** add breadcrumbs component ([056c06d](https://github.com/doug-williamson/RhombusKit/commit/056c06da33fc85054a05d31a84d3bf6c3e0b3740))
* **core:** add dialog component and service ([ae22ffa](https://github.com/doug-williamson/RhombusKit/commit/ae22ffabc679e2f257cd3996f4ed6de66dac301c))
* **core:** add generic menu and refactor overflow-menu onto it ([2be10cb](https://github.com/doug-williamson/RhombusKit/commit/2be10cb7bc246a6f07d7fa88632ce7e2a2dc68f8))
* **core:** add pagination component ([1c6a915](https://github.com/doug-williamson/RhombusKit/commit/1c6a9156823b8b1f34e22fee516cd01351eba377))
* **core:** add spinner and progress bar ([ec9b8d9](https://github.com/doug-williamson/RhombusKit/commit/ec9b8d93f78fea24698d35c568ea9db475ce673f))
* **core:** add tabs directive ([fcf931f](https://github.com/doug-williamson/RhombusKit/commit/fcf931fad6e51fd268f9d31033c21cacdbc4844d))
* **core:** add toast service ([120268a](https://github.com/doug-williamson/RhombusKit/commit/120268aa8d994b8caddd94f1c089e432837740ef))


### Bug Fixes

* **material-preset:** center the indeterminate progress spinner ([fe11b29](https://github.com/doug-williamson/RhombusKit/commit/fe11b292713dc520e309b588891e5b8df7027e4f))
* **material-preset:** size Material surface text to the intended scale ([16b76a7](https://github.com/doug-williamson/RhombusKit/commit/16b76a7f15907995eeaca435c6fe37b5e7b5e57b))
* **material-preset:** size the tooltip text (was inheriting 16px) ([ce9b0ab](https://github.com/doug-williamson/RhombusKit/commit/ce9b0ab81def6bafac803560cd3817e38aa876e5))

## [0.9.0](https://github.com/doug-williamson/RhombusKit/compare/v0.8.0...v0.9.0) (2026-06-04)


### ⚠ BREAKING CHANGES

* **core:** swap <span slot="error"> for <span rhombusError> and import RhombusErrorDirective.

### Features

* **core:** add checkbox component ([4baa839](https://github.com/doug-williamson/RhombusKit/commit/4baa83928a89c290c317fa6f8d9a32263791e633))
* **core:** add radio group component ([1302e32](https://github.com/doug-williamson/RhombusKit/commit/1302e32f9e62ffa86b68da35a2e980a107089634))
* **core:** add switch component ([63cc614](https://github.com/doug-williamson/RhombusKit/commit/63cc614f6b6fc826a51f8cc60c27bd9daed615e6))
* **core:** add tooltip directive ([9988b52](https://github.com/doug-williamson/RhombusKit/commit/9988b52a0b960d8e634b39db0fbae24d92814334))
* **core:** project form-field errors via [rhombusError] marker ([7f05ce0](https://github.com/doug-williamson/RhombusKit/commit/7f05ce0af010bec7a4b448395b204c637b05cae3))

## [0.8.0](https://github.com/doug-williamson/RhombusKit/compare/v0.7.0...v0.8.0) (2026-06-03)


### Features

* **core:** add app-shell hasNav input and themeable sidenav width ([aa9f228](https://github.com/doug-williamson/RhombusKit/commit/aa9f228411691c2f508cd21f6c82d41db5149f65))
* **core:** app-shell hasNav input + themeable sidenav width ([1fe3def](https://github.com/doug-williamson/RhombusKit/commit/1fe3defe13d5298137bac917d7901098cc58bdfe))

## [0.7.0](https://github.com/doug-williamson/RhombusKit/compare/v0.6.0...v0.7.0) (2026-06-03)


### Features

* **core:** add page-header, code-block, and empty-state composites ([2b7fa2e](https://github.com/doug-williamson/RhombusKit/commit/2b7fa2e1dc4a3b2e0b45d32d746513a100fa3daf))
* **core:** page-header, code-block & empty-state composites + sort/icon fixes ([34b39f9](https://github.com/doug-williamson/RhombusKit/commit/34b39f99e58336adf75ce14a27c2bf7473b06c07))


### Bug Fixes

* **core:** center matIconButton icon content ([97d306a](https://github.com/doug-williamson/RhombusKit/commit/97d306ab0bc2fd9571f21983ccf695e69485ba88))
* **core:** flip data-table sort arrow vertically and fade it on clear ([85f722f](https://github.com/doug-williamson/RhombusKit/commit/85f722f26856205218cf07518841a2239f1eb68a))

## [0.6.0](https://github.com/doug-williamson/RhombusKit/compare/v0.5.0...v0.6.0) (2026-06-03)


### Features

* app-shell top-bar layout + showcase dogfood & demo page ([472ea78](https://github.com/doug-williamson/RhombusKit/commit/472ea78c94441a4a44a9f40f5fed5f787ef8fd55))


### Bug Fixes

* **core:** render app-shell header as a full-width top bar ([02fb305](https://github.com/doug-williamson/RhombusKit/commit/02fb3055aa482cd5f7287afa88cfc10c7f0983bb))
* **core:** vertically center rhombus-icon when inline with text ([1a34ce5](https://github.com/doug-williamson/RhombusKit/commit/1a34ce5bb743a52689406e571a595969c739b1ab))

## [0.5.0](https://github.com/doug-williamson/RhombusKit/compare/v0.4.2...v0.5.0) (2026-06-03)


### Features

* **core:** add rhombus-app-shell slotted layout primitive ([cc28cb5](https://github.com/doug-williamson/RhombusKit/commit/cc28cb5405c073fa2ebc6ad85db07a76c27b6ffe))
* **core:** discriminate ColumnDef into DataColumn | DisplayColumn ([5a0b607](https://github.com/doug-williamson/RhombusKit/commit/5a0b6078a967dfec44b1ffb3019f00e9d9c01ece))
* **core:** discriminate ColumnDef into DataColumn | DisplayColumn ([23e0b33](https://github.com/doug-williamson/RhombusKit/commit/23e0b33582e66ff5f291522760f9d3eb1e12ad87))
* **core:** rhombus-app-shell slotted layout primitive ([76581a5](https://github.com/doug-williamson/RhombusKit/commit/76581a54d68f1676b082efa944dc84ecd9fdaf7f))

## [0.4.2](https://github.com/doug-williamson/RhombusKit/compare/v0.4.1...v0.4.2) (2026-06-02)


### Bug Fixes

* **core:** data-table ignores row clicks from interactive cell content ([19e1be2](https://github.com/doug-williamson/RhombusKit/commit/19e1be2b45c3a39b6c7c7812d90febc0601f9473))
* **core:** data-table ignores row clicks from interactive cell content ([d56949b](https://github.com/doug-williamson/RhombusKit/commit/d56949b8d11cd14c4744eee91f6f430689d662e1))

## [0.4.1](https://github.com/doug-williamson/RhombusKit/compare/v0.4.0...v0.4.1) (2026-06-02)


### Bug Fixes

* **core:** theme controls honor RHOMBUS_THEME_CONFIG ([2057766](https://github.com/doug-williamson/RhombusKit/commit/20577666427986d99f0a0611e888c540814c0d83))
* **core:** theme controls honor RHOMBUS_THEME_CONFIG ([701aaeb](https://github.com/doug-williamson/RhombusKit/commit/701aaeb1150c49c73262c23e91ba9824f7ad9777))

## [0.4.0](https://github.com/doug-williamson/RhombusKit/compare/v0.3.0...v0.4.0) (2026-06-02)


### Features

* **core:** render default icons as inline SVG (overflow-menu, theme toggle/menu) ([c65c236](https://github.com/doug-williamson/RhombusKit/commit/c65c236c47579b117839a4946f1c5784d4cbae14))
* **core:** render default icons as inline SVG (overflow-menu, theme toggle/menu) ([f74e060](https://github.com/doug-williamson/RhombusKit/commit/f74e060ff5868f494ee236b447df55057b50ed8d))

## [0.3.0](https://github.com/doug-williamson/RhombusKit/compare/v0.2.0...v0.3.0) (2026-05-29)


### Features

* bridge --mat-sys background + surface-container to CONTRACT ([341d9d4](https://github.com/doug-williamson/RhombusKit/commit/341d9d4259798f843cf2f0774314316732bcc24c))
* provideRhombusTheme for configurable resolved theme names ([d49e355](https://github.com/doug-williamson/RhombusKit/commit/d49e3559449e588c14630d34c3185e41e920c541))


### Bug Fixes

* build theme-engine and core as publishable FESM bundles ([42864ab](https://github.com/doug-williamson/RhombusKit/commit/42864abaebb1619dc4b16633b31a16d678df8949))
* declare @angular/cdk and @angular/forms peer deps for core ([e8d064a](https://github.com/doug-williamson/RhombusKit/commit/e8d064ae7b69e2353b6f522008f6efccdea0938d))
* drop residual publishConfig.provenance from tokens and material-preset ([e00ca77](https://github.com/doug-williamson/RhombusKit/commit/e00ca77c6993450a88958cc932e603f671f01e7f))
* ship correct published artifacts for theme-engine and core ([bfa27f1](https://github.com/doug-williamson/RhombusKit/commit/bfa27f12a981c737a7591eb149e93102a22275f6))

## [0.2.0](https://github.com/doug-williamson/RhombusKit/compare/v0.1.0...v0.2.0) (2026-05-29)


### Features

* **core, showcase:** [rhombusBadge] directive + showcase page ([574cf66](https://github.com/doug-williamson/RhombusKit/commit/574cf66edf12fe151a250a36387322f5794e09f1))
* **core, showcase:** [rhombusChip] + [rhombusChipGroup] + showcase page ([a246fa2](https://github.com/doug-williamson/RhombusKit/commit/a246fa2e6ca5a9e6e6ecb9d47555abc326c9a3ee))
* **core, showcase:** add [rhombusBadge] directive + showcase page ([b9fe6b4](https://github.com/doug-williamson/RhombusKit/commit/b9fe6b41dd06a8a9e0fcffb8a656663e5b48d3e4))
* **core, showcase:** add [rhombusChip] + [rhombusChipGroup] + showcase ([1dcb43e](https://github.com/doug-williamson/RhombusKit/commit/1dcb43e614823ff354712563e13fe9cf29606989))
* **core, showcase:** add rhombus-button + showcase shell + button page ([1959120](https://github.com/doug-williamson/RhombusKit/commit/1959120040a054ea0230249684d5d76957ea5935))
* **core, showcase:** add rhombus-card + showcase page ([6eacce8](https://github.com/doug-williamson/RhombusKit/commit/6eacce83553848c55a35a286fc45f4b66fa41a8f))
* **core, showcase:** add rhombus-input + textarea + select + showcase ([bf31015](https://github.com/doug-williamson/RhombusKit/commit/bf3101524645f1068563af6d1a76a25b4e754636))
* **core, showcase:** rhombus-button + showcase shell + button page ([bc55d73](https://github.com/doug-williamson/RhombusKit/commit/bc55d73e24b23758c9354181afe79dbf5235bfc2))
* **core, showcase:** rhombus-card + showcase page ([aa3d967](https://github.com/doug-williamson/RhombusKit/commit/aa3d967a5817627e9738278b66a2ac048212198f))
* **core:** add controlled sort, sortStart, and responsive column hint to data-table ([2884769](https://github.com/doug-williamson/RhombusKit/commit/2884769b143e378cbe4eb06b7143f5600da18e6b))
* **core:** add overflow menu and confirm dialog ([b9edc39](https://github.com/doug-williamson/RhombusKit/commit/b9edc399d3dbb7ea9354fab8221dac49818a767e))
* **core:** add overflow menu and confirm dialog ([2274f98](https://github.com/doug-williamson/RhombusKit/commit/2274f98b8321f1d7b0d956335365d2bb2ab71dde))
* **core:** add rhombus-data-table component ([2a96475](https://github.com/doug-williamson/RhombusKit/commit/2a96475cac4902a114f9a14dc9520fd396bc5ccc))
* **core:** add rhombus-data-table component ([25827ea](https://github.com/doug-williamson/RhombusKit/commit/25827ea21b5e52f07db40cc9ff1afa9687e16824))
* **core:** controlled sort, sortStart, and responsive column hint for data-table ([c84423c](https://github.com/doug-williamson/RhombusKit/commit/c84423c50e278c974316c9971f3228335b4fc0c9))
* **showcase:** mobile-first shell with responsive sidenav ([60e7c10](https://github.com/doug-williamson/RhombusKit/commit/60e7c108cf59334192a5d3fe93f2f07f3dca93b6))
* theme engine, theme controls, and flash prevention (0.2.0) ([2e002c7](https://github.com/doug-williamson/RhombusKit/commit/2e002c7a12f0c680091c87ffdecd841202a06214))
* **theme-engine:** add RhombusThemeService with system preference and flash prevention ([967386b](https://github.com/doug-williamson/RhombusKit/commit/967386b5b4dc3e83cd61787e26fcc0437f85a5c6))
* **tokens, material-preset, core:** add --error CONTRACT + fix proxy uses ([06f08c4](https://github.com/doug-williamson/RhombusKit/commit/06f08c4ecf2ed7958f88859c6db00dcea542150a))
* **tokens, material-preset:** add font CONTRACT + M3 system token bridge ([812d10e](https://github.com/doug-williamson/RhombusKit/commit/812d10ea0448c877faefa4ad0da8ba54f52abffe))
* **tokens, material-preset:** font CONTRACT + M3 system token bridge ([aea7844](https://github.com/doug-williamson/RhombusKit/commit/aea7844c7d8eda82fd51b131dc3f7425bcfcf434))
* **tokens:** align CONTRACT with FolioKit naming, add two-layer focus ([c889270](https://github.com/doug-williamson/RhombusKit/commit/c889270cff5eb2e0abe94cfbf5103b192b7d5711))


### Bug Fixes

* **core, showcase:** own the form control instead of projecting it ([cb7821f](https://github.com/doug-williamson/RhombusKit/commit/cb7821f3b1d12dca995822f7f93fe4aa4a3df942))
* **core:** suppress global focus ring on form-field controls ([8645148](https://github.com/doug-williamson/RhombusKit/commit/864514892acb26936b34f3cd2d3927bcc1ea5832))
* **material-preset:** wire M3 corner / shape scale into the bridge ([f035cbb](https://github.com/doug-williamson/RhombusKit/commit/f035cbb15098642836be6b44727c103a7d035f15))
* **material-preset:** wire M3 state-layer opacities into the bridge ([44ca85e](https://github.com/doug-williamson/RhombusKit/commit/44ca85e47d7b1921ca1dc80b193ef110d5013ad8))
* **material-preset:** wire M3 typography scale; ux: header theme toggle ([9f0b826](https://github.com/doug-williamson/RhombusKit/commit/9f0b82653749bb1333578ac139cecf675ab9294f))
* **showcase:** align theme toggle to header text rhythm ([d78a45a](https://github.com/doug-williamson/RhombusKit/commit/d78a45a7c74d06ec6280c961bd51b3091ea79f46))
* **showcase:** centre theme toggle icon inside its button ([7a36481](https://github.com/doug-williamson/RhombusKit/commit/7a364818d358bffaff287d391a62cf5fca860ea7))
* **showcase:** remove mobile tap-flash on sidenav nav links ([4897072](https://github.com/doug-williamson/RhombusKit/commit/4897072a9d9380f0175969cbc4b61ae5606c4e84))
* **showcase:** style submit button and stop native form reload ([a183a13](https://github.com/doug-williamson/RhombusKit/commit/a183a13b450e441f95d314c841d279d21dfbb9df))
