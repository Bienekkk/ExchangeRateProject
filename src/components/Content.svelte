<script>
	export let title;
</script>

<div>
	<div class="container mx-auto text-center md:text-left">
		<h1 class="text-white text-3xl font-bold mb-3 my-auto">{title}</h1>
		<slot />
	</div>
</div>
