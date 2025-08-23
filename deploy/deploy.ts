import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedIdentityManagement = await deploy("IdentityManagement", {
    from: deployer,
    log: true,
  });

  console.log(`IdentityManagement contract: `, deployedIdentityManagement.address);

  await hre.run("verify:verify", {
    address: deployedIdentityManagement.address,
    constructorArguments: [], // No constructor arguments for this contract
  });
};
export default func;
func.id = "deploy_IdentityManagement"; // id required to prevent reexecution
func.tags = ["IdentityManagement"];
