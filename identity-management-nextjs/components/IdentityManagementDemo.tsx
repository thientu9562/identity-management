"use client";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useIdentityManagement } from "@/hooks/useIdentityManagement";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { useState } from "react";

/*
 * Main IdentityManagement React component with buttons for register and prove.
 */
export const IdentityManagementDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  //////////////////////////////////////////////////////////////////////////////
  // FHEVM instance
  //////////////////////////////////////////////////////////////////////////////

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true, // use enabled to dynamically create the instance on-demand
  });

  //////////////////////////////////////////////////////////////////////////////
  // useIdentityManagement is a custom hook containing all the IdentityManagement logic, including
  // - calling the IdentityManagement contract
  // - encrypting FHE inputs
  //////////////////////////////////////////////////////////////////////////////

  const identityManagement = useIdentityManagement({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage, // is global, could be invoked directly in useIdentityManagement hook
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  // Local states for inputs
  const [age, setAge] = useState<number>(25);
  const [isStudent, setIsStudent] = useState<boolean>(false);
  const [passportHash, setPassportHash] = useState<string>("0x1234567890123456789012345678901234567890123456789012345678901234"); // Example as hex string
  const [city, setCity] = useState<number>(1001);
  const [countryCode, setCountryCode] = useState<number>(0); // 0: US, 1: CA, 2: EU

  //////////////////////////////////////////////////////////////////////////////
  // UI Stuff:
  // --------
  // A basic page containing
  // - A bunch of debug values allowing you to better visualize the React state
  // - Inputs for register fields
  // - 1x "Register Identity" button
  // - 2x "Prove" buttons
  //////////////////////////////////////////////////////////////////////////////

  const buttonClass =
    "inline-flex items-center justify-center rounded-xl bg-black px-4 py-4 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const titleClass = "font-semibold text-black text-lg mt-4";
  const inputClass = "border border-gray-300 rounded p-2 mr-2 w-full mb-2";

if (!isConnected) {
    console.log("isConnected:", isConnected);
    console.log("connect function:", connect);
    return (
      <div className="mx-auto">
        <button
          className={buttonClass}
          disabled={isConnected}
          onClick={async () => {
            console.log("Attempting to connect...");
            try {
              await connect();
              console.log("Connected successfully");
            } catch (error) {
              console.error("Connection error:", error);
            }
          }}
        >
          <span className="text-4xl p-6">Connect to MetaMask</span>
        </button>
      </div>
    );
  }

  if (identityManagement.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="grid w-full gap-4">
      <div className="col-span-full mx-20 bg-black text-white">
        <p className="font-semibold  text-3xl m-5">
          FHEVM React Minimal Template -{" "}
          <span className="font-mono font-normal text-gray-400">
            IdentityManagement.sol
          </span>
        </p>
      </div>
      <div className="col-span-full mx-20 mt-4 px-5 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Chain Infos</p>
        {printProperty("ChainId", chainId)}
        {printProperty(
          "Metamask accounts",
          accounts
            ? accounts.length === 0
              ? "No accounts"
              : `{ length: ${accounts.length}, [${accounts[0]}, ...] }`
            : "undefined"
        )}
        {printProperty(
          "Signer",
          ethersSigner ? ethersSigner.address : "No signer"
        )}

        <p className={titleClass}>Contract</p>
        {printProperty("IdentityManagement", identityManagement.contractAddress)}
        {printProperty("isDeployed", identityManagement.isDeployed)}
      </div>
      <div className="col-span-full mx-20">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>FHEVM instance</p>
            {printProperty(
              "Fhevm Instance",
              fhevmInstance ? "OK" : "undefined"
            )}
            {printProperty("Fhevm Status", fhevmStatus)}
            {printProperty("Fhevm Error", fhevmError ?? "No Error")}
          </div>
          <div className="rounded-lg bg-white border-2 border-black pb-4 px-4">
            <p className={titleClass}>Status</p>
            {printProperty("isRefreshing", identityManagement.isRefreshing)}
            {printProperty("isRegistering", identityManagement.isRegistering)}
            {printProperty("isProving", identityManagement.isProving)}
            {printProperty("canGetRegistration", identityManagement.canGetRegistration)}
            {printProperty("canRegister", identityManagement.canRegister)}
            {printProperty("canProve", identityManagement.canProve)}
          </div>
        </div>
      </div>
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Identity Status</p>
        {printProperty("isRegistered", identityManagement.isRegistered)}
        {printProperty("requestIdOver18", identityManagement.requestIdOver18)}
        {printProperty("requestIdOver21", identityManagement.requestIdOver21)}
      </div>
      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className={titleClass}>Register Identity (if not registered)</p>
        <input
          className={inputClass}
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          placeholder="Age (e.g., 25)"
        />
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={isStudent}
            onChange={(e) => setIsStudent(e.target.checked)}
            className="mr-2"
          />
          Is Student
        </label>
        <input
          className={inputClass}
          type="text"
          value={passportHash}
          onChange={(e) => setPassportHash(e.target.value)}
          placeholder="Passport Hash (hex string)"
        />
        <input
          className={inputClass}
          type="number"
          value={city}
          onChange={(e) => setCity(Number(e.target.value))}
          placeholder="City Code (e.g., 1001)"
        />
        <input
          className={inputClass}
          type="number"
          value={countryCode}
          onChange={(e) => setCountryCode(Number(e.target.value))}
          placeholder="Country Code (0: US, 1: CA, 2: EU)"
        />
        <button
          className={buttonClass}
          disabled={!identityManagement.canRegister}
          onClick={() => identityManagement.registerIdentity(age, isStudent, BigInt(passportHash), city, countryCode)}
        >
          {identityManagement.canRegister
            ? "Register Identity"
            : identityManagement.isRegistering
              ? "Registering..."
              : identityManagement.isRegistered
                ? "Already Registered"
                : "Cannot Register"}
        </button>
      </div>
      <div className="grid grid-cols-2 mx-20 gap-4">
        <button
          className={buttonClass}
          disabled={!identityManagement.canProve}
          onClick={identityManagement.proveAgeOver18}
        >
          {identityManagement.canProve
            ? "Prove Age > 18"
            : identityManagement.isProving
              ? "Proving..."
              : !identityManagement.isRegistered
                ? "Register First"
                : "Cannot Prove"}
        </button>
        <button
          className={buttonClass}
          disabled={!identityManagement.canProve}
          onClick={identityManagement.proveAgeOver21AndValidCountry}
        >
          {identityManagement.canProve
            ? "Prove Age > 21 & Valid Country"
            : identityManagement.isProving
              ? "Proving..."
              : !identityManagement.isRegistered
                ? "Register First"
                : "Cannot Prove"}
        </button>
      </div>
      <div className="col-span-full mx-20 p-4 rounded-lg bg-white border-2 border-black">
        {printProperty("Message", identityManagement.message)}
      </div>
    </div>
  );
};

function printProperty(name: string, value: unknown) {
  let displayValue: string;

  if (typeof value === "boolean") {
    return printBooleanProperty(name, value);
  } else if (typeof value === "string" || typeof value === "number") {
    displayValue = String(value);
  } else if (typeof value === "bigint") {
    displayValue = String(value);
  } else if (value === null) {
    displayValue = "null";
  } else if (value === undefined) {
    displayValue = "undefined";
  } else if (value instanceof Error) {
    displayValue = value.message;
  } else {
    displayValue = JSON.stringify(value);
  }
  return (
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-black">{displayValue}</span>
    </p>
  );
}

function printBooleanProperty(name: string, value: boolean) {
  if (value) {
    return (
      <p className="text-black">
        {name}:{" "}
        <span className="font-mono font-semibold text-green-500">true</span>
      </p>
    );
  }

  return (
    <p className="text-black">
      {name}:{" "}
      <span className="font-mono font-semibold text-red-500">false</span>
    </p>
  );
}