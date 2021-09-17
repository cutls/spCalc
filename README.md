# sp-calc

いつでもカエドキプログラム(docomo)やスマホトクするプログラム(au)などの
残価設定型の分割が増えてややこしくなったので計算機を作りました。

## 端末を追加する

public/assetsの中に端末価格のデータがたくさん入っています。

```
{
    storeId: 英語でスペースが無いように
    storeName: 販売先の名前
    totalPrice: 一括で買ったときの価格
    splitMonthsWhenProgram: 何回分割か
    programJoinFee: プログラム参加手数料(無ければ0)
    discountWhenNew: 5G WELCOME割のような端末購入時の割引の計算。新規契約
    discountWhenMNP: 5G WELCOME割のような端末購入時の割引の計算。MNP
    discountWhenChange: 5G WELCOME割のような端末購入時の割引の計算。機種変更
    twoStepsLoan: 残価設定ローンならtrue、そうでないならfalse
    returnableAfter: 何か月後から端末を返却できるか(返却できないなら0)
    oneStep: 残価設定ローンの設定月。だいたい24。(残価設定ではないなら0)
    restWhenOneStepPrice: 残価
    restWhenOneStepRate: 0(そのうち使うかもしれない)
    ifReturnBeforeByMonth: いつでもカエドキの早期利用特典など、残価設定ローン時の返却に伴う割引(月額)
    ifReturnBeforeTotal: 0(そのうち使うかもしれない)
}
```

こんな感じで、他のファイルを参考にしながら書いて、Pull Requestを送るか、Issueを作成してください。

[Issueの新規作成](https://github.com/cutls/spCalc/issues/new) -> titleを適当にきめて、コメントに上のデータを入れてください。

データを作るのが不可能な場合、上の項目のうち「機種名」「一括価格」「残価」「MNP, 新規時の割引」を箇条書きしてIssueに書いてくれても構いません。

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
