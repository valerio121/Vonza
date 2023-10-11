"use client";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useEffect, useState } from "react";
import { EthereumLogo } from "@/components/icons/ethereum-eth-logo";

function Siwe({ redirect = true, callbackUrl = "/" }) {
  const { signMessageAsync } = useSignMessage();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { data: session, status } = useSession();

  const handleLogin = async () => {
    try {
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: chain?.id,
        nonce: await getCsrfToken(),
      });
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });
      const response = await signIn("credentials", {
        message: JSON.stringify(message),
        redirect,
        signature,
        callbackUrl,
      });

      // if (response?.ok) {
      //   redirect(callbackUrl);
      // }
    } catch (error) {
      window.alert(error);
    }
  };

  // auto connect
  // useEffect(() => {
  //   console.log(isConnected);
  //   if (isConnected && !session) {
  //     handleLogin();
  //   }
  // }, [isConnected]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (!isConnected) {
          connect();
        } else {
          handleLogin();
        }
      }}
      className="flex w-full cursor-pointer items-center justify-center rounded-[8px] border border-brand-primary/80 bg-brand-primary/10 px-[16px] py-1.5 font-semibold tracking-wider  transition-colors duration-300 hover:bg-brand-primary/40 dark:text-brand-gray100 dark:hover:text-brand-gray50"
    >
      <span className="mx-3 my-1 h-6">
        <EthereumLogo />
      </span>
      Sign in with Ethereum
    </button>
  );
}

export async function getServerSideProps(context: any) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

export default Siwe;
