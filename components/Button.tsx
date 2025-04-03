import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class={`py-2 px-4 rounded font-bold ${
        props.class || "bg-blue-500 hover:bg-blue-700 text-white"
      }`}
    />
  );
}
