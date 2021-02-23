
const w = 1600;
const h = 400;
const padding = 60;
const colorNumber = 5;
const lw = 200;         // legend width.

const svg = d3.select('#container')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('viewBox', '0 0 ' + w + ' ' + h);

svg.append('title')
    .attr('id', 'title')
    .text('Global Temperature');

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then((data) => {
        const dataset = data.monthlyVariance;

        // Title and description.
        const years = [...new Set(dataset.map(d => d.year))];
        svg.append('desc')
            .attr('id', 'description')
            .text(
            '' + d3.min(years) + ' - ' + d3.max(years) + ', base temperature: ' + data.baseTemperature
            );

        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', w / 2)
            .attr('y', padding * 0.4)
            .text(svg.select('title').text());

        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', w / 2)
            .attr('y', padding * 0.8)
            .text(svg.select('desc').text());

        // Scales for x-axis, y-axis and color.
        const xScale = d3.scaleBand()
                            .domain(years)
                            .range([padding, (w - padding)]);
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const yScale = d3.scaleBand()
                            .domain(months)
                            .range([padding, (h - padding)]);

        const minVariance = d3.min(dataset, d => d.variance);
        const maxVariance = d3.max(dataset, d => d.variance);
        const colorScale = d3.scaleQuantize()
                                .domain([minVariance, maxVariance])
                                .range(d3.schemeSpectral[colorNumber].reverse());

        // Heat map.
        svg.selectAll('rect')
            .data(dataset)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('data-month', d => d.month - 1)
            .attr('data-year', d => d.year)
            .attr('data-temp', d => d.variance)
            .attr('x', (d) => xScale(d.year))
            .attr('y', d => yScale(months[d.month - 1]))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(d.variance))
            .on('mouseover', function(d) {
                const dataYear = d.year;
                d3.select(this).attr('stroke', 'black');
                const tooltip = d3.select('#container')
                                    .append('div')
                                    .attr('id', 'tooltip')
                                    .attr('data-year', dataYear)
                                    .html(
                                        '<div>' + months[d.month - 1] + ' ' + d.year + '</div>' +
                                        '<div>' + (d.variance > 0 ? '+' : '') + d.variance + '</div>'
                                    );
                tooltip.attr('style',
                    'top: ' + (yScale(months[d.month - 1]) - document.getElementById('tooltip').offsetHeight) + 'px;' +
                    'left: ' + (xScale(d.year) - document.getElementById('tooltip').offsetWidth) + 'px;'
                );
            })
            .on('mouseout', function(d) {
                d3.select('#tooltip').remove();
                d3.select(this).attr('stroke', 'none');
            });

        // x-axis and y-axis.
        const xAxis = d3.axisBottom(xScale)
                        .tickValues(years.filter(year => year % 10 === 0));
        const yAxis = d3.axisLeft(yScale);
        svg.append('g')
            .attr('id', 'x-axis')
            .attr('transform', 'translate(0, ' + (h - padding) + ')')
            .call(xAxis);
        svg.append('g')
            .attr('id', 'y-axis')
            .attr('transform', 'translate(' + padding + ', 0)')
            .call(yAxis);

        // Legend.
        const legend = svg.append('g').attr('id', 'legend');
        d3.schemeSpectral[colorNumber].map((color, index) => {
            legend.append('rect')
                    .attr('width', lw / colorNumber)
                    .attr('height', 20)
                    .attr('x', padding + lw / colorNumber * index)
                    .attr('y', 360)
                    .attr('fill', color);
        });

        const legendScale = d3.scaleLinear()
                                .domain([minVariance, maxVariance])
                                .range([0, lw]);

        const legendAxis = d3.axisBottom(legendScale)
                                .tickValues(d3.range(
                                    minVariance,
                                    maxVariance + (maxVariance - minVariance) / 5,
                                    (maxVariance - minVariance) / 5
                                ))
                                .tickFormat(d3.format('+.1f'));
        legend.append('g')
            .attr('transform', 'translate(' + padding + ', 380)')
            .call(legendAxis);
    });
