<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Content from '../../components/Content.svelte';
	import Chart from 'chart.js/auto';

	let historicalRates = writable<number[]>([]);
	let historicalRatesOunce = writable<number[]>([]);
	let historicalDates = writable<string[]>([]);
	let days = writable<number>(7);
	let trendInfo = writable<{ text: string; image: string }[]>([]);
	let chart: Chart | null = null;
	const OUNCE_IN_GRAMS = 28.0;

	const formatDate = (date: Date): string => date.toISOString().split('T')[0];

	async function fetchHistoricalRates() {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(endDate.getDate() - $days);

		const url = `https://api.nbp.pl/api/cenyzlota/${formatDate(startDate)}/${formatDate(endDate)}`;

		try {
			const response = await fetch(url);
			const data = await response.json();

			if (data && Array.isArray(data)) {
				const gramPrices = data.map((d) => d.cena);
				historicalDates.set(data.map((d) => d.data));
				historicalRates.set(gramPrices);
				historicalRatesOunce.set(gramPrices.map((price) => price * OUNCE_IN_GRAMS));

				analyzeTrends(gramPrices);
				renderChart();
			}
		} catch (error) {
			console.error('Błąd podczas pobierania danych:', error);
		}
	}

	function analyzeTrends(prices: number[]) {
		const periods = [7, 30, 90, 180, 365]; // 1 tydzień, 1 miesiąc, 3 miesiące, 6 miesięcy
		let trendResults: { text: string; image: string }[] = [];

		periods.forEach((period) => {
			if (prices.length >= period) {
				const start = prices[prices.length - period];
				const end = prices[prices.length - 1];
				const trend = end > start ? 'Increasing ' : 'Decreasing';
				const image = end > start ? '📈' : '📉';
				trendResults.push({ text: `${period} dni: ${trend}`, image });
			}
		});
		trendInfo.set(trendResults);
	}

	function renderChart() {
		const ctx = document.getElementById('goldChart') as HTMLCanvasElement;
		if (chart) {
			chart.destroy();
		}

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: $historicalDates,
				datasets: [
					{
						label: 'Gold Price (PLN/gram)',
						data: $historicalRates,
						borderColor: 'gold',
						backgroundColor: 'rgba(255, 215, 0, 0.2)',
						fill: true,
						borderWidth: 2,
						pointRadius: 0
					},
					{
						label: 'Gold Price (PLN/ounce)',
						data: $historicalRatesOunce,
						borderColor: 'orange',
						backgroundColor: 'rgba(255, 140, 0, 0.2)',
						fill: true,
						borderWidth: 3,
						borderDash: [5, 5],
						pointRadius: 0,
						pointBackgroundColor: 'orange'
					}
				]
			},
			options: {
				maintainAspectRatio: false,
				responsive: true,
				scales: {
					x: { title: { display: true, text: 'Date' } },
					y: { title: { display: true, text: 'Price (PLN)' } }
				}
			}
		});
	}

	onMount(fetchHistoricalRates);
</script>

<svelte:head>
	<title>Gold Prices Chart</title>
</svelte:head>
<Content title="Gold Prices Chart" />

<div class="container mt-4 h-96 bg-gray-900 p-4 rounded-lg shadow-lg">
	<canvas id="goldChart" />
</div>

<div class="mt-4">
	<label class="text-white font-semibold" for="days">Number of days:</label>
	<input
		id="days"
		type="number"
		min="1"
		max="180"
		bind:value={$days}
		on:input={fetchHistoricalRates}
		class="ml-2 p-2 border border-gray-300 rounded-lg bg-gray-700 text-white"
	/>
</div>

<div class="mt-4 p-4 bg-gray-800 rounded-lg shadow-md text-white">
	<h2 class="text-lg font-semibold">Trend Analysis:</h2>
	{#each $trendInfo as trend}
		<div class="flex items-center mt-2">
			<span class="text-xl">{trend.image}</span>
			<span class="ml-2">{trend.text}</span>
		</div>
	{/each}
</div>
