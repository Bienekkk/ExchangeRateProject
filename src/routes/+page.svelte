<script lang="ts">
	import Content from '../components/Content.svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let amount = writable<number>(1);
	let convertedAmount = writable<number>();
	let fromCurrency = writable<string>('PLN');
	let toCurrency = writable<string>('EUR');
	let exchangeRates = writable<Record<string, number>>({});

	async function fetchRates() {
		try {
			const responses = await Promise.all([
				fetch('https://api.nbp.pl/api/exchangerates/tables/A?format=json'),
				fetch('https://api.nbp.pl/api/exchangerates/tables/B?format=json'),
				fetch('https://api.nbp.pl/api/exchangerates/tables/C?format=json')
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

			console.log('Updated exchange rates:', rates); // Debugging output
			exchangeRates.set(rates);
		} catch (error) {
			console.error('Error fetching exchange rates:', error);
		}
		convert();
	}

	function convert() {
		const rates = $exchangeRates; // Get the actual object from the store

		if (rates[$fromCurrency] && rates[$toCurrency]) {
			const am = (($amount / rates[$toCurrency]) * rates[$fromCurrency]).toFixed(2);
			convertedAmount.set(parseFloat(am));
		}
	}

	function convert2() {
		const rates = $exchangeRates; // Get the actual object from the store

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
	}

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
		<select bind:value={$toCurrency} on:change={convert}>
			{#each Object.keys($exchangeRates) as currency}
				<option value={currency}>{currency}</option>
			{/each}
		</select>
	</div>
</div>
