import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>Flow</title>
        <link rel="stylesheet" href="/style.css" />
      </Head>

      <canvas id="flow" height="1080px" width="1920px" style="max-width: 100%;"></canvas>

      <script src="main.js" type="module"></script>
    </>
  );
}
