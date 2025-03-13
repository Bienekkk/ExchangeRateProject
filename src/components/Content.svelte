<script>
	export let title;
</script>

<div>
	<div class="container mx-auto">
		<h1 class="text-white text-3xl font-bold mb-3">{title}</h1>
		<slot />
	</div>
</div>
