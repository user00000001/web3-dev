# web3-dev
experience from https://www.youtube.com/watch?v=gyMwXuJrbJQ, managed by git worktree in one repository.


BranchName|Contents|Repo
---|---|---
ethers000|ethers usage|[ethers000](https://github.com/user00000001/ethers000)
hardhat000|hardhat usage|[hardhat000](https://github.com/user00000001/hardhat000)
hardhat001|hardhat usage, (fundme)|[hardhat001](https://github.com/user00000001/hardhat001)
hardhat002|hardhat usage, (lottery/raffle)|[hardhat002](https://github.com/user00000001/hardhat002)
hardhat003|hardhat usage, (starter kit/ERC20/DeFi & Aave)|[hardhat003](https://github.com/user00000001/hardhat003)
hardhat004|hardhat usage, (NFT)|[hardhat004](https://github.com/user00000001/hardhat004)
hardhat005|hardhat usage, (NFT marketplace)|[hardhat005](https://github.com/user00000001/hardhat005)
hardhat006|hardhat usage, (Upgrades/DAOs/Security&Auditing)|[hardhat006](https://github.com/user00000001/hardhat006)
hardhat007|full-stack web3|[hardhat007](https://github.com/user00000001/hardhat007)
hardhat008|web3 full stack by create-web3-dapp|[hardhat008](https://github.com/user00000001/hardhat008)
foundry00|solidity test (foundry) usage|[foundry00](https://github.com/user00000001/foundry00)

## git worktree usage, while the others like submodule/subtree create more repos.

```shell
git worktree add -b/-B ${new-branch-name} ${worktree-path} ${branch-name}
git worktree list
git branch -vv
git worktree remove [-f] ${worktree-path} 
git worktree prune -n # just check worktree status
git worktree prune -v
git worktree move ${worktree-path} ${new-worktree-path}
git worktree list [--porcelain]
git worktree lock [--reason msg] ${worktree-path} # temp worktree-path, like paths in the /tmp
git worktree unlock ${worktree-path}
git worktree repair ${worktree-path} # repo was moved, repair worktree

git worktree add branches/foundry00 foundry00
cd branches/foundry00; git log; code .
cd .. && git worktree remove foundry00
```