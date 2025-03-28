<script>
	import Content from '../../components/Content.svelte';
</script>

<svelte:head>
	<title>About</title>
</svelte:head>

<Content title="About" />

<div
	class="mx-auto flex-col mx-auto items-center gap-x-4 rounded-xl p-12 outline outline-black/5 bg-gray-800 dark:bg-slate-100 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
>
	<h1 class="text-white text-xl text-center pb-4">Exchange Project</h1>
	<p class="text-white text-center text-xl">
		Exchange-Project is an innovative platform that aims to provide users with current information
		about gold prices and rates of various currencies. Thanks to our tools, you can keep up to date
		track market changes and make more informed investment decisions. Our website provides quick
		access to the latest data, guaranteeing ease of use and reliability. Whether you are interested
		in gold, dollars, euros or other currencies, Exchange-Project is the the ideal source of
		information.
	</p>
</div>

<div class="flex items-center ml-5 relative justify-center">
	<span class="block relative w-80">
		<a href="https://api.nbp.pl/"
			><img
				alt="CR7"
				src="/images/npm-logo-name.png"
				class="mx-auto object-cover rounded-full"
			/></a
		>
	</span>
</div>
