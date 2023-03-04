# Flow
ツイキャス用．某動画サイト風にコメントを流すことができます．

## Usage

初めに `twicaskey.json` の `CLIENT_ID` と `CLIENT_SECRET` を設定します．
キーは https://twitcasting.tv/developer.php で取得できます．


次のコマンドを実行すると localhost:8000 でコメントサーバーが起動します．

```
deno task start
```

`http://localhost:8000?id={放送主のID}` にアクセスするとコメントが画面上を流れます．
ブラウザソースとしてOBSに取り込むこともできます．

## Demo

![2023-03-05 02-38-19](https://user-images.githubusercontent.com/117683899/222921017-687f3e5b-6281-4004-b36c-945ecbe79847.gif)
