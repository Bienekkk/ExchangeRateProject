<script lang="ts">
	import Content from '../components/Content.svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Chart from 'chart.js/auto';

	let amount = writable<number>(1);
	let convertedAmount = writable<number>();
	let fromCurrency = writable<string>('PLN');
	let toCurrency = writable<string>('EUR');
	let exchangeRates = writable<Record<string, number>>({});
	let historicalRates = writable<number[]>([]);
	let historicalDates = writable<string[]>([]);
	let days = writable<number>(30);
	let chart: Chart | null = null;

	async function fetchRates() {
		try {
			const responses = await Promise.all([
				fetch('https://api.nbp.pl/api/exchangerates/tables/A?format=json'),
				fetch('https://api.nbp.pl/api/exchangerates/tables/B?format=json')
				//fetch('https://api.nbp.pl/api/exchangerates/tables/C?format=json')
			]);
			const data = await Promise.all(responses.map((res) => res.json()));

			let rates: Record<string, number> = { PLN: 1 };
			data.flat().forEach((table) => {
				table.rates.forEach((rate: { code: string; mid?: number; bid?: number; ask?: number }) => {
					if (rate.mid) {
						rates[rate.code] = rate.mid;
					} else if (rate.bid && rate.ask) {
						rates[rate.code] = (rate.bid + rate.ask) / 2;
					}
				});
			});

			exchangeRates.set(rates);
		} catch (error) {
			console.error('Error fetching exchange rates:', error);
		}
		convert();
		fetchHistoricalRates();
	}

	function convert() {
		const rates = $exchangeRates;
		if (rates[$fromCurrency] && rates[$toCurrency]) {
			const am = (($amount / rates[$toCurrency]) * rates[$fromCurrency]).toFixed(2);
			convertedAmount.set(parseFloat(am));
		}
	}

	function convert2() {
		const rates = $exchangeRates;
		if (rates[$fromCurrency] && rates[$toCurrency]) {
			const am = (($convertedAmount / rates[$toCurrency]) * rates[$fromCurrency]).toFixed(2);
			amount.set(parseFloat(am));
		}
	}

	function swapCurrencies() {
		let temp;
		fromCurrency.update((value) => {
			temp = value;
			return $toCurrency;
		});
		if (temp) {
			toCurrency.set(temp);
		}
		convert();
		fetchHistoricalRates();
	}

	async function fetchHistoricalRates() {
		try {
			const responses = await Promise.all([
				fetch(
					`https://api.nbp.pl/api/exchangerates/rates/A/${$toCurrency}/last/${$days}?format=json`
				).then((res) => (res.ok ? res.json() : null)),
				fetch(
					`https://api.nbp.pl/api/exchangerates/rates/B/${$toCurrency}/last/${$days}?format=json`
				).then((res) => (res.ok ? res.json() : null))
			]);

			const dataA = responses[0]?.rates || [];
			const dataB = responses[1]?.rates || [];

			const dates = dataA.length
				? dataA.map((rate: { effectiveDate: string }) => rate.effectiveDate)
				: dataB.map((rate: { effectiveDate: string }) => rate.effectiveDate);
			const ratesA = dataA.map((rate: { mid: number }) => rate.mid);
			const ratesB = dataB.map((rate: { mid: number }) => rate.mid);

			const combinedRates = dates.map((_, index) => {
				const rateA = ratesA[index] ?? 0;
				const rateB = ratesB[index] ?? 0;
				return rateA && rateB ? (rateA + rateB) / 2 : rateA || rateB;
			});

			historicalDates.set(dates);
			historicalRates.set(combinedRates);
			updateChart();
		} catch (error) {
			console.error('Error fetching historical rates:', error);
		}
	}

	function updateChart() {
		if (chart) {
			chart.destroy();
		}

		const ctx = document.getElementById('exchangeRateChart') as HTMLCanvasElement;
		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: $historicalDates,
				datasets: [
					{
						label: `Exchange Rate of ${$toCurrency} over the last ${days} days`,
						data: $historicalRates,
						borderColor: 'green',
						fill: false
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false
			}
		});
	}

	$: fetchHistoricalRates(); // Update chart when currency changes

	onMount(fetchRates);
</script>

<svelte:head>
	<title>Exchange Rate Project</title>
</svelte:head>
<Content title="Currency prices" />

<div class="container flex gap-3 items-center md:flex-row flex-col">
	<div>
		<input type="number" bind:value={$amount} on:input={convert} />
		<select bind:value={$fromCurrency} on:change={convert}>
			{#each Object.keys($exchangeRates) as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</div>
	<button class="text-white w-8 h-8" on:click={swapCurrencies}>
		<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
			><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
				id="SVGRepo_tracerCarrier"
				stroke-linecap="round"
				stroke-linejoin="round"
			/><g id="SVGRepo_iconCarrier">
				<g data-name="Layer 2">
					<g data-name="swap">
						<rect width="24" height="24" transform="rotate(-90 12 12)" opacity="0" />
						<path
							d="M4 9h13l-1.6 1.2a1 1 0 0 0-.2 1.4 1 1 0 0 0 .8.4 1 1 0 0 0 .6-.2l4-3a1 1 0 0 0 0-1.59l-3.86-3a1 1 0 0 0-1.23 1.58L17.08 7H4a1 1 0 0 0 0 2z"
						/>
						<path
							d="M20 16H7l1.6-1.2a1 1 0 0 0-1.2-1.6l-4 3a1 1 0 0 0 0 1.59l3.86 3a1 1 0 0 0 .61.21 1 1 0 0 0 .79-.39 1 1 0 0 0-.17-1.4L6.92 18H20a1 1 0 0 0 0-2z"
						/>
					</g>
				</g>
			</g></svg
		>
	</button>
	<div>
		<input type="number" bind:value={$convertedAmount} on:input={convert2} />
		<select
			bind:value={$toCurrency}
			on:change={() => {
				convert();
				fetchHistoricalRates();
			}}
		>
			{#each Object.keys($exchangeRates) as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</div>
</div>

<div class="container mt-4 h-96">
	<canvas id="exchangeRateChart" />
</div>

<div class="mt-4">
	<label class="text-white" for="days">Number of days:</label>
	<input
		id="days"
		type="number"
		min="1"
		max="90"
		bind:value={$days}
		on:input={fetchHistoricalRates}
	/>
</div>
