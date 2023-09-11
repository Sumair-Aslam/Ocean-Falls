# Ocean Falls indemnity

## install dependencies
 `npm i`
 
## compile contracts
 `npx hardhat compile`

## test contracts
 `npx hardhat coverage`

```
------------------------------|----------|----------|----------|----------|----------------|
File                          |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------------------------|----------|----------|----------|----------|----------------|
 contracts/                   |    80.95 |       50 |       65 |    81.54 |                |
  CapitalReserve.sol          |    96.72 |     62.5 |    84.62 |    96.77 |        149,157 |
  Factory.sol                 |      100 |       50 |      100 |      100 |                |
  FeatureControl.sol          |       50 |       50 |       50 |    57.14 |       23,37,47 |
  Globals.sol                 |      100 |      100 |      100 |      100 |                |
  OFERC20.sol                 |    63.04 |       25 |       50 |    64.58 |... 117,118,130 |
  SampleToken.sol             |        0 |      100 |        0 |        0 |          12,16 |
 contracts/interfaces/        |      100 |      100 |      100 |      100 |                |
  IFactory.sol                |      100 |      100 |      100 |      100 |                |
  IOFERC20.sol                |      100 |      100 |      100 |      100 |                |
 contracts/libraries/         |    95.65 |       60 |    94.44 |    93.62 |                |
  ContinuousInterest.sol      |    92.86 |       50 |      100 |    92.86 |          55,56 |
  Fractional.sol              |      100 |      100 |      100 |      100 |                |
  HitchensUnorderedKeySet.sol |      100 |     62.5 |    83.33 |    93.75 |             66 |
------------------------------|----------|----------|----------|----------|----------------|
All files                     |    84.88 |    51.85 |    74.14 |    84.75 |                |
------------------------------|----------|----------|----------|----------|----------------|
```
