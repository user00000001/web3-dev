# Operations

## install hardhat & packages

```shell
# pnpm env --global use 16.x.x
pnpm init 
pnpm i -D "hardhat@~2.9.0"
pnpm hardhat init # typescript

# remove eslint supports, not good at it, handling it is too boring and spend time.
pnpm install --save-dev "hardhat@~2.9.9" "@nomiclabs/hardhat-waffle@^2.0.0" "ethereum-waffle@^3.0.0"^
 "chai@^4.2.0" "hardhat-deploy@^0.10.5" "ethers@^5.0.0" "@nomiclabs/hardhat-etherscan@^3.0.0"^
 "dotenv@^16.0.0" "hardhat-gas-reporter@^1.0.4" "prettier@^2.3.2" "prettier-plugin-solidity@^1.0.0-beta.13"^
 "solhint@^3.3.6" "solidity-coverage@^0.7.16" "@typechain/ethers-v5@^7.0.1" "@typechain/hardhat@^2.3.0"^
 "@types/chai@^4.2.21" "@types/node@^12.0.0" "@nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers@0.3.0-beta.13"^
 "@types/mocha@^9.0.0" "ts-node@^10.1.0" "typechain@^5.1.2" "typescript@^4.5.2" "@openzeppelin/contracts@^4"^
 "@openzeppelin/hardhat-upgrades@~1.15.0"

pnpm hardhat node --hostname 0.0.0.0 --no-deploy

```

## upgrade by hardhat-upgrades

```shell
pnpm hardhat run scripts/otherUpgradeExamples/deploy.ts --network localhost # then set env PROXY_OF_BOX
pnpm hardhat run scripts/otherUpgradeExamples/prepare-upgrade.ts --network localhost
pnpm hardhat run scripts/otherUpgradeExamples/upgrade.ts --network localhost

# set env NEXT_PROXY_ADMIN
# It seems not transfer again at this version. (always using hre default signer, can't specify signer)
pnpm hardhat run scripts/otherUpgradeExamples/transfer-ownership.ts --network localhost
```

## Governance

```shell
pnpm hardhat deploy --tags all --network localhost
echo -n '{"31337":[],"1":[],"11155111":[]}' > proposals.json

pnpm hardhat run --network localhost scripts/propose.ts
pnpm hardhat run --network localhost scripts/votes.ts
pnpm hardhat run --network localhost scripts/queue-and-executes.ts
```

## Audit Tool Usage

### Slither 

Open the docker shell:

```
pnpm run toolbox
```

Then, run:

```
slither /src/contracts/ --solc-remaps @openzeppelin=/src/node_modules/@openzeppelin --exclude naming-convention,external-function,low-level-calls
```

To exit:

```
exit
```


### Echidna

Open the docker shell:

```
pnpm run toolbox
```

Then, run this:

```
echidna-test /src/contracts/test/fuzzing/VaultFuzzTest.sol --contract VaultFuzzTest --config /src/contracts/test/fuzzing/config.yaml
```

To exit:

```
exit
```

# What is an Audit?

An audit is a security focused code review for looking for issues with your code. 

# Help your auditors!

When writing good code, you 100% need to follow these before sending you code to an audit.

[Tweet from legendary security expert Tincho](https://twitter.com/tinchoabbate/status/1400170232904400897)

-   Add comments
    -   This will help your auditors understand what you're doing.
-   Use [natspec](https://docs.soliditylang.org/en/v0.8.11/natspec-format.html)
    -   Document your functions. DOCUMENT YOUR FUNCTIONS.
-   Test
    -   If you don't have tests, and test coverage of all your functions and lines of code, you shouldn't go to audit. If your tests don't pass, don't go to audit.
-   Be ready to talk to your auditors
    -   The more communication, the better.
-   Be prepared to give them plenty of time.
    -   They literally pour themselves over your code.

> "At this time, there are 0 good auditors that can get you an audit in under a week. If an auditor says they can do it in that time frame, they are either doing you a favor or they are shit. " - Patrick Collins, March 4th, 2022

# Process

An auditors process looks like this:

1. Run tests
2. Read specs/docs
3. Run fast tools (like slither, linters, static analysis, etc)
4. Manual Analysis
5. Run slow tools (like echidna, manticore, symbolic execution, MythX)
6. Discuss (and repeat steps as needed)
7. Write report ([Example report](https://github.com/transmissions11/solmate/tree/main/audits))

Typically, you organize reports in a chart that looks like this:


![impact image](images/impact.png)


# Resources

These are some of the best places to learn even MORE about security:

PRs welcome to improve the list.

## Tools

-   [Slither](https://github.com/crytic/slither)
    -   Static analysis from Trail of Bits.
-   [Echidna](https://github.com/crytic/echidna)
    -   Fuzzing from Trail of Bits.
-   [Manticore](https://github.com/trailofbits/manticore)
    -   Symbolic execution tool from Trail of Bits.
-   [MythX](https://mythx.io/)
    -   Paid service for smart contract security.
-   [Mythrill](https://github.com/ConsenSys/mythril)
    -   MythX free edition.
-   [ETH Security Toolbox](https://github.com/trailofbits/eth-security-toolbox)
    -   Script to create docker containers configured with Trail of Bits security tools.
-   [ethersplay](https://github.com/crytic/ethersplay)
    -   ETH Disassembler
-   [Consensys Security Tools](https://consensys.net/diligence/tools/)
    -   A list of Consensys tools.

## Games

-   [Ethernaut](https://ethernaut.openzeppelin.com/) (This is a must play!)
-   [Damn Vulnerable Defi](https://www.damnvulnerabledefi.xyz/) (This is a must play!)

## Blogs

-   [rekt](https://rekt.news/)
    -   A blog that keeps up with all the "best" hacks in the industry.
-   [Trail of bits blog](https://blog.trailofbits.com/)
    -   Learn from one of the best auditors in the space.
-   [Openzeppelin Blog](https://blog.openzeppelin.com/)
    -   Another blog of one of the best auditors in the space.

## Audit Examples:
- [Openzeppelin](https://blog.openzeppelin.com/fei-audit-2/)
- [Sigma Prime](https://tracer.finance/radar/sigma-prime-audit/)
- [Trail of Bits](https://alephzero.org/blog/trail-of-bits-audit-security/)

## Articles

-   [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
    -   Consensys blog on security vulnerabilities. Also [check out their tools.](https://consensys.net/diligence/tools/)
-   [Chainlink X Certik Blog on Security](https://www.certik.com/resources/blog/technology/top-10-defi-security-best-practices)
    -   I helped write this. 😊
-   [More attacks](https://consensys.github.io/smart-contract-best-practices/attacks/denial-of-service/)