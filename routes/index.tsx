import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>Flow</title>
        <link rel="stylesheet" href="/style.css" />
        <link rel="stylesheet" href="/flow.css" />
      </Head>

      <canvas id="flow" height="720px" width="1280px" style="height: 360px; width: 640px;"></canvas>

      <script src="/main.js" type="module"></script>
    </>
  );
}
