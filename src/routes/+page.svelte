<script lang="ts">
	let { data } = $props();
</script>

<h1>cloudflare:workers protocol repro</h1>
<p>env module imported: {String(data.imported)}</p>
<p>
	See
	<a href="https://github.com/sveltejs/kit/issues/17271">sveltejs/kit#17271</a>
</p>
