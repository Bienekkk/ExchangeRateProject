<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let chart: Chart | null = null;
    let goldPrices: Array<{ data: string; cena: number }> = [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const url = `https://api.nbp.pl/api/cenyzlota/${formatDate(startDate)}/${formatDate(endDate)}`;

    onMount(async () => {
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data && Array.isArray(data)) {
                goldPrices = data.map(d => ({ data: d.data, cena: d.cena }));
                renderChart();
            }
        } catch (error) {
            console.error('Błąd podczas pobierania danych:', error);
        }
    });

    function renderChart() {
        const ctx = document.getElementById('goldChart') as HTMLCanvasElement;
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: goldPrices.map(d => d.data),
                datasets: [{
                    label: 'Cena złota (PLN/gram)',
                    data: goldPrices.map(d => d.cena),
                    borderColor: 'gold',
                    backgroundColor: 'rgba(255, 215, 0, 0.2)',
                    fill: true,
                }],
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Data' } },
                    y: { title: { display: true, text: 'Cena (PLN)' } }
                }
            }
        });
    }
</script>

<svelte:head>
    <title>Gold Prices Chart</title>
</svelte:head>

<h1 class="text-white">Gold Prices Chart</h1>
<canvas id="goldChart"></canvas>
