# TheGraph Project

## env

```shell
# not supperts 16.x.x now, fix `Error: Unable to fetch available networks from API`
pnpm use --global 18.x.x

# env proxy variables not available.
proxychains pnpm graph init --product subgraph-studio --studio EthereumSepolia --from-contract \
0x3e7FA6E903CB8774247221131Be32E19671ED276 --protocol ethereum --network sepolia EthereumSepolia
```