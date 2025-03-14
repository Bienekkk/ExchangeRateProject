<script lang="ts">
	import Content from '../../components/Content.svelte';
	import { onMount } from 'svelte';

	let tasks: Array<{ Data: string; Code: number }> = [];
	const url = 'https://api.nbp.pl/api/cenyzlota';

	onMount(async () => {
		try {
			const response = await fetch(url);
			const data = await response.json();

			if (data && Array.isArray(data)) {
				tasks = data;
			} else {
				tasks = [];
			}
		} catch (error) {
			console.error('Błąd podczas pobierania danych:', error);
			tasks = [];
		}
	});
</script>

<svelte:head>
	<title>Gold prices</title>
</svelte:head>

<Content title="Gold prices" />

{#if tasks.length > 0}
	<table>
		<thead>
			<tr>
				<th class="text-white">Data</th>
				<th class="text-white">Cena za gram (PLN)</th>
			</tr>
		</thead>

		{#each tasks as t}
			<tr>
				<!-- <td class="text-white">{t.Data}</td>
				<td class="text-white">{t.Code}</td> -->
			</tr>
		{/each}
	</table>
{:else}
	<p class="text-white">Brak danych do wyświetlenia.</p>
{/if}
