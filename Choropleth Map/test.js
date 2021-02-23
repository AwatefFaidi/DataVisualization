const svg = d3.select('#map');

const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0);


const unemployment = d3.map();
const path = d3.geoPath();
  // Scales for x-axis, y-axis and color, legend

const yScale = d3.scaleLinear()
  .domain([2.6, 75.1]) 
  .rangeRound([400, 100]); 

const color = d3.scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
  .range(d3.schemeGreens[9]);

const legend = d3.select('#legend').append('g')
  .attr('class', 'key')
  .attr('id', 'legend')
.attr('transform-origin', 'left')
  .attr('transform', 'translate(50, 0)');

legend.selectAll('rect')
  .data(color.range().map(d => {
    d = color.invertExtent(d);
    if (d[0] == null) d[0] = yScale.domain()[0];
    if (d[1] == null) d[1] = yScale.domain()[1];
    return d;
  }))
  .enter().append('rect')
  .attr('width', 8)
  .attr('y', d => yScale(d[1]) + 1)
  .attr('height', d => yScale(d[0]) - yScale(d[1]))
  .attr('fill', d => color(d[0]));

legend.append('text')
  .attr('class', 'caption')
  .attr('y', () => yScale.range().reduce((acc, val) => acc + val, 0)/2)
  .attr('x', 6)
  .attr('fill', '#fff')
  .attr('transform-origin', 'left')
  .attr('text-anchor', 'middle')
  .attr('font-size', '1.5em')
  .style('transform', 'rotateZ(90deg)')
  .text("Bachelor's degree or higher");

legend.call(d3.axisLeft(yScale)
  .tickSize(13)
  .tickFormat(val => Math.round(val) + '%')
  .tickValues(color.domain()))
  .select('.domain')
  .remove();



    // Choropleth map.
const g = svg.append('g');

svg.call(d3.zoom().on('zoom', () => {
  g.attr('transform', d3.event.transform)
}));

Promise.all([
  d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json'),
  d3.json('https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json')
]).then(
  (data) => {
    const education = data[0], us = data[1];
    g.append('g')
      .attr('class', 'counties')
      .selectAll('path')
      .data(topojson.feature(us, us.objects.counties).features)
      .enter().append('path')
      .attr('class', 'county')
      .attr('data-fips', d => d.id)
      .attr('data-education', d => {
        const result = education.filter(obj => obj.fips == d.id);
        return result[0] ? result[0].bachelorsOrHigher : 0;
      })
      .attr('fill', d => {
        const result = education.filter(obj => obj.fips == d.id);
        return result[0] ? color(result[0].bachelorsOrHigher) : 0;
      })
      .attr('d', path)
      .on('mouseover', d => {
        tooltip.style('opacity', .9);
        tooltip.html(() => {
          const result = education.filter(obj => obj.fips == d.id);
          return result[0]
            ? result[0]['area_name'] + ', ' + result[0]['state'] + ': ' + result[0].bachelorsOrHigher + '%'
            : 0;
        })
          .attr('data-education', () => {
            const result = education.filter(obj => obj.fips == d.id);
            return result[0] ? result[0].bachelorsOrHigher : 0;
          })
          .style('left', (d3.event.pageX + 10) + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    g.append('path')
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr('class', 'states')
      .attr('d', path);
  }
).catch(err => console.log(err));