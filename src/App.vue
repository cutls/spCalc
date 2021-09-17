<template>
	<div id="app">
		<Init />
		<div class="notice">
			<p><b>計算結果は推定値ですので、実際とは異なる場合があります。</b></p>
			<p>頭金は0円として計算しています。また、本体価格データはオンラインストアの値段です。実店舗では異なる場合があります。</p>
			<p>楽天モバイルの48回分割は楽天カードでのみ可能で、また機種変更時に必要な手数料3300円はシステム上初期費用として初月に算入しています。</p>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Init from './components/Init.vue'

export default Vue.extend({
	name: 'App',
	components: {
		Init
	}
})
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
.notice {
	text-align: left;
	border: 1px solid;
	padding: 10px;
	margin-top: 20px;
}
.notice p {
	margin: 0;
}
</style>
