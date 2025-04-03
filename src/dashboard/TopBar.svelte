<script>
	import { openSidebar } from './store.ts';
</script>

<header class="bg-[#0e141b] h-20 items-center relative z-10">
	<div class="flex flex-center flex-col h-full justify-center mx-auto px-3 relative">
		<div class="flex items-center pl-1 relative w-full sm:pr-2 sm:ml-0 lg:max-w-68">
			<div class="container flex left-0 relative w-5/6 h-full justify-between lg:justify-center">
				<div class="flex group h-full items-center relative w-12">
					<button
						type="button"
						aria-expanded="false"
						aria-label="Toggle sidenav"
						on:click={openSidebar}
						class="text-4xl text-white focus:outline-none lg:hidden left-0 -mt-2"
					>
						&#8801;
					</button>
				</div>
				<div class="flex h-full items-center w-100 lg:w-100">
					<div
						class="text-nowrap block flex h-full w-100 items-center justify-center align-center p-3 pr-2 text-white md:text-4xl text-xl uppercase"
					>
						Exchange Rate Project
					</div>
				</div>
			</div>
			<div class="flex items-center justify-end ml-5 p-1 relative w-1/6 sm:mr-0 sm:right-auto">
				<span class="block relative">
					<img
						alt="CR7"
						src="/images/npm-logo.png"
						class="h-10 mx-auto object-cover rounded-full w-10"
					/>
				</span>
			</div>
		</div>
	</div>
</header>
