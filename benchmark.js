const benchmarkButton = document.getElementById('runBenchmarkBtn');
const benchmarkResults = document.getElementById('benchmarkResults');

function runSampleWorkload(iterations) {
  const values = [];
  let total = 0;

  for (let i = 1; i <= iterations; i += 1) {
    values.push(i % 1000);
    total += Math.sqrt(i) * Math.sin(i * 0.01);
  }

  return {
    total,
    count: values.length
  };
}

function formatMs(value) {
  return `${value.toFixed(2)} ms`;
}

function runBenchmark() {
  if (!benchmarkResults) {
    return;
  }

  benchmarkButton.disabled = true;
  benchmarkButton.textContent = 'Running...';

  benchmarkResults.style.display = 'block';
  benchmarkResults.classList.remove('is-error', 'is-success');
  benchmarkResults.classList.add('is-updated');
  benchmarkResults.innerHTML = 'Benchmark in progress...';

  setTimeout(() => {
    const limit = 1000000;

    console.time('For loop benchmark');
    const forStart = performance.now();
    let forTotal = 0;

    for (let i = 1; i <= limit; i += 1) {
      forTotal += i;
    }

    const forElapsed = performance.now() - forStart;
    console.timeEnd('For loop benchmark');

    console.time('While loop benchmark');
    const whileStart = performance.now();
    let whileTotal = 0;
    let counter = 1;

    while (counter <= limit) {
      whileTotal += counter;
      counter += 1;
    }

    const whileElapsed = performance.now() - whileStart;
    console.timeEnd('While loop benchmark');

    const sampleStart = performance.now();
    const sampleResult = runSampleWorkload(200000);
    const sampleElapsed = performance.now() - sampleStart;

    console.log('Sample function benchmark:', {
      durationMs: Number(sampleElapsed.toFixed(2)),
      itemsProcessed: sampleResult.count,
      checksum: Number(sampleResult.total.toFixed(2))
    });

    console.log('Benchmark summary:', {
      forLoopMs: Number(forElapsed.toFixed(2)),
      whileLoopMs: Number(whileElapsed.toFixed(2)),
      sampleFunctionMs: Number(sampleElapsed.toFixed(2)),
      forLoopTotal: forTotal,
      whileLoopTotal: whileTotal
    });

    benchmarkResults.classList.remove('is-updated', 'is-error');
    benchmarkResults.classList.add('is-success');
    benchmarkResults.innerHTML =
      `For loop: ${formatMs(forElapsed)}<br>` +
      `While loop: ${formatMs(whileElapsed)}<br>` +
      `Sample function (performance.now): ${formatMs(sampleElapsed)}`;

    benchmarkButton.disabled = false;
    benchmarkButton.textContent = 'Run Benchmark';
  }, 40);
}

if (benchmarkButton) {
  benchmarkButton.addEventListener('click', runBenchmark);
}
