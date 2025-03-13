<script lang="ts">
	import Content from '../components/Content.svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let amount = writable<number>(1);
	let convertedAmount = writable<number>(0);
	let fromCurrency = writable<string>('USD');
	let toCurrency = writable<string>('EUR');
	let exchangeRates = writable<Record<string, number>>({});

	async function fetchRates() {
		try {
			const responses = await Promise.all([
				fetch('https://api.nbp.pl/api/exchangerates/tables/A?format=json'),
				fetch('https://api.nbp.pl/api/exchangerates/tables/B?format=json'),
				fetch('https://api.nbp.pl/api/exchangerates/tables/C?format=json') // Added Table C
			]);
			const data = await Promise.all(responses.map((res) => res.json()));

			let rates: Record<string, number> = { PLN: 1 };
			data.flat().forEach((table) => {
				table.rates.forEach((rate: { code: string; mid?: number; bid?: number; ask?: number }) => {
					if (rate.mid) {
						rates[rate.code] = rate.mid; // Use 'mid' for Tables A and B
					} else if (rate.bid && rate.ask) {
						rates[rate.code] = (rate.bid + rate.ask) / 2; // Average of bid/ask for Table C
					}
				});
			});

			console.log('Updated exchange rates:', rates); // Debugging output
			exchangeRates.set(rates);
		} catch (error) {
			console.error('Error fetching exchange rates:', error);
		}
	}

	function convert() {
		const rates = $exchangeRates; // Get the actual object from the store
		console.log(rates, $fromCurrency, $toCurrency, rates[$fromCurrency], rates[$toCurrency]);

		if (rates[$fromCurrency] && rates[$toCurrency]) {
			convertedAmount.set(($amount / rates[$toCurrency]) * rates[$fromCurrency]);
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
	}

	onMount(fetchRates);
</script>

<svelte:head>
	<title>Exchange Rate Project</title>
</svelte:head>
<Content title="Currency prices" />

<div class="container flex gap-3">
	<div>
		<input type="number" bind:value={$amount} />
		<select bind:value={$fromCurrency}>
			{#each Object.keys($exchangeRates) as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</div>
	<button class="text-white" on:click={swapCurrencies}>SWAP</button>
	<div>
		<input type="number" bind:value={$convertedAmount} disabled />
		<select bind:value={$toCurrency}>
			{#each Object.keys($exchangeRates) as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</div>
</div>
<button on:click={convert}>Convert</button>
