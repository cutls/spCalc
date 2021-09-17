<template>
	<div class="hello">
		<h1>スマホ分割購入シミュレータ</h1>
		機種
		<select v-model="model" @change="deviceChange()">
			<optgroup :label="cat.name" v-for="cat of models" :key="cat.name">
				<option v-for="m of cat.models" :key="m.file" :value="m.file">
					{{ m.name }}
				</option>
			</optgroup>
		</select>
		<form name="carrierSelect">
			<div v-for="c of carriers" :key="c.storeId" class="checkbox">
				<input type="checkbox" :id="`${c.storeId}UseProgram`" :value="`${c.storeId}UseProgram`" name="carrier" checked />
				<label :for="`${c.storeId}UseProgram`">{{ c.storeName }}({{ c.splitMonthsWhenProgram }}回分割)</label>
				<input type="checkbox" :id="`${c.storeId}1`" :value="`${c.storeId}1`" name="carrier" />
				<label :for="`${c.storeId}1`">{{ c.storeName }}(一括)</label>
			</div>
		</form>
		<div><input type="number" v-model="useFor" />か月使用</div>
		<button @click="calc()" type="button">計算</button>
		<div id="result">
			<div v-for="p of prices" :key="p.name" class="table">
				<p>{{ p.name }}</p>
				返却:
				<template v-if="!p.requiredReturn">
					不
				</template>
				要
				<table>
					<tr>
						<td>初月</td>
						<td>{{ Math.floor(p.first) }}</td>
					</tr>
					<tr>
						<td>月々</td>
						<td>{{ Math.floor(p.monthly1) }}</td>
					</tr>
					<tr v-if="p.monthly2">
						<td>月々<br />({{ p.monthly2Str }})</td>
						<td>{{ Math.floor(p.monthly2) }}</td>
					</tr>
					<tr>
						<td>最終月</td>
						<td>{{ Math.floor(p.last) }}</td>
					</tr>
					<tr>
						<td>合計</td>
						<td>{{ Math.floor(p.total) }}</td>
					</tr>
				</table>

				<p class="message">{{ p.message }}</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Store, Price } from '../../types'
export default Vue.extend({
	name: 'Init',
	data() {
		return {
			models: [] as any,
			model: null,
			carriers: [] as Store[],
			useFor: 24,
			prices: [] as Price[]
		}
	},
	mounted: async function() {
		const models = await (await fetch(`/assets/list.json`)).json()
		const ml = {} as any
		for (const m of models) {
			ml[m.cat] ? ml[m.cat].push(m) : (ml[m.cat] = [m])
		}
		const ma = []
		for (const [key, value] of Object.entries(ml)) {
			ma.push({
				name: key,
				models: value
			})
		}
		this.models = ma
	},
	methods: {
		deviceChange: async function() {
			if (!this.model) return false
			const data = await (await fetch(`/assets/${this.model}`)).json()
			this.carriers = data
		},
		calc: function() {
			const carriers = (document as any).carrierSelect.carrier
			const prices = [] as Price[]
			for (const car of carriers) {
				const ca = car.value
				if (!car.checked) continue
				const pureStoreName = ca.replace('UseProgram', '').replace('1', '')
				const c = this.getCarrierData(pureStoreName)
				const obj = {} as Price
				if (ca.includes('UseProgram')) {
					const useFor = this.useFor >= c.returnableAfter || !c.returnableAfter ? this.useFor : c.returnableAfter
					if (this.useFor < c.returnableAfter && c.returnableAfter) obj.message = `${c.returnableAfter}か月(返却までの最低利用期間)以上利用したときの計算結果です。`
					const requiredReturn = !!c.returnableAfter
					obj.requiredReturn = requiredReturn
					obj.name = `${c.storeName}(${c.splitMonthsWhenProgram}回分割)`
					//2段階であれば残価を引いてそれを分割する
					const monthly1 = c.twoStepsLoan ? (c.totalPrice - (c.restWhenOneStepPrice || c.restWhenOneStepRate * c.totalPrice)) / (c.oneStep - 1) : c.totalPrice / c.splitMonthsWhenProgram
					obj.first = monthly1 + c.programJoinFee

					obj.monthly1 = monthly1
					//2段階で再分割前に終了したとき
					if (c.twoStepsLoan && useFor < c.oneStep) {
						const lastBefore = c.totalPrice - (c.restWhenOneStepPrice || c.restWhenOneStepRate * c.totalPrice) - useFor * monthly1
						const last = lastBefore - (c.ifReturnBeforeTotal || c.ifReturnBeforeByMonth * (c.oneStep - 1 - useFor))
						obj.last = last < 1 ? 0 : last
						obj.monthly2Str = `${c.oneStep}か月まで支払う場合`
						obj.monthly2 = obj.last / (c.oneStep - 1 - useFor || 1)
						obj.total = monthly1 * useFor + c.programJoinFee + last
					}
					//2段階で再度分割されたとき
					if (c.twoStepsLoan && useFor >= c.oneStep) {
						const rest = c.restWhenOneStepPrice || c.restWhenOneStepRate * c.totalPrice
						const monthly2 = rest / (c.splitMonthsWhenProgram - c.oneStep)
						obj.monthly2 = monthly2
						obj.monthly2Str = `${c.oneStep + 1}か月目以降`
						obj.total = monthly1 * (c.oneStep - 1) + c.programJoinFee + monthly2 * (useFor - c.oneStep + 1)
						obj.last = 0
					}
					//通常の分割で、返却可能な場合(強制的に使用)
					if (!c.twoStepsLoan && requiredReturn) {
						const useForMax = useFor > c.returnableAfter ? c.returnableAfter : useFor
						obj.last = 0
						obj.total = monthly1 * useForMax + c.programJoinFee
					}
					//通常の分割で、返却が不要な場合
					if (!c.twoStepsLoan && !requiredReturn) {
						const useForMax = useFor > c.splitMonthsWhenProgram ? c.splitMonthsWhenProgram : useFor
						obj.last = c.totalPrice - monthly1 * useForMax
						obj.total = c.totalPrice + c.programJoinFee
					}
				} else {
					obj.name = `${c.storeName}(一括)`
					obj.first = c.totalPrice
					obj.monthly1 = 0
					obj.last = 0
					obj.total = c.totalPrice
					obj.requiredReturn = false
				}
				prices.push(obj)
			}
			console.log(prices)
			this.prices = prices
			return true
		},
		getCarrierData: function(pureStoreName: string) {
			for (const c of this.carriers) {
				if (c.storeId === pureStoreName) return c
			}
			return this.carriers[0]
		}
	}
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
table {
	width: 300px;
}
.table {
	width: 310px;
	margin: 5px;
	border: 1px solid;
	text-align: left;
	padding: 5px;
}
#result {
	display: flex;
	flex-wrap: wrap;
}
select,
input[type='number'] {
	width: 300px;
	max-width: 100%;
	height: 2rem;
	margin-bottom: 20px;
	margin-top: 20px;
	margin-right: 10px;
}
button {
	width: 150px;
	height: 2rem;
}
.checkbox {
	padding: 5px;
}
input[type='checkbox'] {
	margin: 10px;
}
.message {
	font-weight: bold;
}
</style>
