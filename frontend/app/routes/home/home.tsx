// import {Navigation} from "~/components/navigation";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Capstone Project" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return(
    <>

      {/* Remember to add back */}
      {/* <Navigation/> */}

      <h1 className={'text-3xl font-bold'}> Home </h1>

    </>
  )
}
