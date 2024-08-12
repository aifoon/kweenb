import React from "react";
import { useAppStore } from "../hooks/useAppStore";
import { Loader } from "@components/Loader";

type HydrationHelperProps = {
  children: React.ReactElement;
};

export const HydrationHelper = (props: HydrationHelperProps) => {
  const indexedDBLoaded = useAppStore((state) => state.rehydrated);
  return (
    <>
      {!indexedDBLoaded && <Loader text="Loading internal data" />}
      {indexedDBLoaded && props.children}
    </>
  );
};
