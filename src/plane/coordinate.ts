import { getTheme, setTheme } from '../theme';

export function coordinate(width: number, height: number) {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const grid = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const axes = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const labels = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const content = document.createElementNS("http://www.w3.org/2000/svg", "g");
  
  let unit = 50; // 默认1个单位对应50像素
  
  group.appendChild(grid);
  group.appendChild(axes);
  group.appendChild(labels);
  group.appendChild(content);
  
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  const xArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  const yArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  
  xAxis.setAttribute("x1", (-width / 2).toString());
  xAxis.setAttribute("y1", "0");
  xAxis.setAttribute("x2", (width / 2).toString());
  xAxis.setAttribute("y2", "0");
  xAxis.setAttribute("stroke", "black");
  xAxis.setAttribute("stroke-width", "2");
  
  yAxis.setAttribute("x1", "0");
  yAxis.setAttribute("y1", (-height / 2).toString());
  yAxis.setAttribute("x2", "0");
  yAxis.setAttribute("y2", (height / 2).toString());
  yAxis.setAttribute("stroke", "black");
  yAxis.setAttribute("stroke-width", "2");
  
  xArrow.setAttribute("points", "-5,-4 0,0 5,-4 0,8");
  xArrow.setAttribute("transform", `translate(${width / 2}, 0) rotate(-90)`);
  xArrow.setAttribute("fill", "black");
  xArrow.setAttribute("stroke", "none");
  
  yArrow.setAttribute("points", "-5,4 0,0 5,4 0,-8");
  yArrow.setAttribute("transform", `translate(0, ${-height / 2})`);
  yArrow.setAttribute("fill", "black");
  yArrow.setAttribute("stroke", "none");
  
  axes.appendChild(xAxis);
  axes.appendChild(yAxis);
  axes.appendChild(xArrow);
  axes.appendChild(yArrow);
  
  const rtn = {
    node: () => group,
    origin,
    grid: setGrid,
    ticks: setTicks,
    labels: setLabels,
    stroke,
    add,
    unit: setUnit,
    axisStyle,
    gridStyle,
    hideAxis,
    hideGrid,
    hideLabels,
    zoom,
    pan,
    snap,
    exportSVG,
    addMarker,
    addText,
    theme,
  }

  function origin(x: number, y: number) {
    group.setAttribute("transform", `translate(${x},${y})`);
    return rtn;
  }

  function add(element: { 
    node: () => SVGElement, 
    scale?: (x: number, y?: number) => any,
    offset?: (x: number, y: number) => any  // 添加 offset 支持
  }) {
    if (element.scale) {
      element.scale(unit);
    }
    if (element.offset) {
      // 计算偏移量，使函数图像正确定位在坐标系中
      element.offset(0, 0);  // 重置到原点
    }
    content.appendChild(element.node());
    return rtn;
  }

  function setUnit(value: number) {
    unit = value;
    // 更新网格和刻度
    if (grid.children.length > 0) {
      setGrid(unit);
    }
    if (axes.children.length > 4) { // 4是两个轴线和两个箭头
      setTicks(unit);
    }
    // 更新所有已添加的图形
    Array.from(content.children).forEach(child => {
      const element = child as SVGElement;
      if (element.getAttribute('data-original-transform')) {
        const transform = element.getAttribute('data-original-transform');
        element.setAttribute('transform', `scale(${unit}) ${transform}`);
      } else {
        const transform = element.getAttribute('transform') || '';
        element.setAttribute('data-original-transform', transform);
        element.setAttribute('transform', `scale(${unit}) ${transform}`);
      }
    });
    return rtn;
  }

  function setGrid(interval: number) {
    grid.innerHTML = "";
    
    const verticalCount = Math.ceil(width / 2 / interval);
    const horizontalCount = Math.ceil(height / 2 / interval);
    
    for (let i = -verticalCount; i <= verticalCount; i++) {
      if (i === 0) continue;
      const x = i * interval;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x.toString());
      line.setAttribute("y1", (-height / 2).toString());
      line.setAttribute("x2", x.toString());
      line.setAttribute("y2", (height / 2).toString());
      line.setAttribute("stroke", "#ddd");
      line.setAttribute("stroke-width", "1");
      grid.appendChild(line);
    }
    
    for (let i = -horizontalCount; i <= horizontalCount; i++) {
      if (i === 0) continue;
      const y = i * interval;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", (-width / 2).toString());
      line.setAttribute("y1", y.toString());
      line.setAttribute("x2", (width / 2).toString());
      line.setAttribute("y2", y.toString());
      line.setAttribute("stroke", "#ddd");
      line.setAttribute("stroke-width", "1");
      grid.appendChild(line);
    }
    
    return rtn;
  }

  function setTicks(interval: number, length: number = 6) {
    // 清除旧的刻度
    while (axes.children.length > 4) { // 保留两个轴线和两个箭头
      axes.removeChild(axes.lastChild);
    }
    
    const verticalCount = Math.ceil(width / 2 / interval);
    const horizontalCount = Math.ceil(height / 2 / interval);
    
    for (let i = -verticalCount; i <= verticalCount; i++) {
      if (i === 0) continue;
      const x = i * interval;
      const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
      tick.setAttribute("x1", x.toString());
      tick.setAttribute("y1", (-length / 2).toString());
      tick.setAttribute("x2", x.toString());
      tick.setAttribute("y2", (length / 2).toString());
      tick.setAttribute("stroke", "black");
      tick.setAttribute("stroke-width", "2");
      axes.appendChild(tick);
    }
    
    for (let i = -horizontalCount; i <= horizontalCount; i++) {
      if (i === 0) continue;
      const y = i * interval;
      const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
      tick.setAttribute("x1", (-length / 2).toString());
      tick.setAttribute("y1", y.toString());
      tick.setAttribute("x2", (length / 2).toString());
      tick.setAttribute("y2", y.toString());
      tick.setAttribute("stroke", "black");
      tick.setAttribute("stroke-width", "2");
      axes.appendChild(tick);
    }
    
    return rtn;
  }

  function setLabels(interval: number, step: number = 1, format: (n: number) => string = String) {
    labels.innerHTML = "";
    const verticalCount = Math.ceil(width / 2 / interval);
    const horizontalCount = Math.ceil(height / 2 / interval);
    
    for (let i = -verticalCount; i <= verticalCount; i++) {
      if (i === 0) continue;
      const x = i * interval;
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", x.toString());
      text.setAttribute("y", "20");
      text.setAttribute("text-anchor", "middle");
      text.textContent = format(i * step);
      labels.appendChild(text);
    }
    
    for (let i = -horizontalCount; i <= horizontalCount; i++) {
      if (i === 0) continue;
      const y = i * interval;
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", "20");
      text.setAttribute("y", y.toString());
      text.setAttribute("dominant-baseline", "middle");
      text.textContent = format(-i * step);
      labels.appendChild(text);
    }
    
    return rtn;
  }

  function stroke(color: string) {
    xAxis.setAttribute("stroke", color);
    yAxis.setAttribute("stroke", color);
    xArrow.setAttribute("fill", color);
    yArrow.setAttribute("fill", color);
    return rtn;
  }

  function axisStyle(options: {
    color?: string,
    width?: number,
    opacity?: number,
    dashArray?: string
  }) {
    xAxis.setAttribute('stroke', options.color || 'black');
    xAxis.setAttribute('stroke-width', options.width?.toString() || '2');
    xAxis.setAttribute('stroke-opacity', options.opacity?.toString() || '1');
    xAxis.setAttribute('stroke-dasharray', options.dashArray || '');
    // Apply same to yAxis
    return rtn;
  }

  function gridStyle(options: {
    color?: string,
    width?: number,
    opacity?: number,
    dashArray?: string
  }) {
    grid.childNodes.forEach(node => {
      const line = node as SVGLineElement;
      line.setAttribute('stroke', options.color || '#ddd');
      line.setAttribute('stroke-width', options.width?.toString() || '1');
      line.setAttribute('stroke-opacity', options.opacity?.toString() || '1');
      line.setAttribute('stroke-dasharray', options.dashArray || '');
    });
    return rtn;
  }

  function hideAxis() {
    axes.style.display = 'none';
    return rtn;
  }

  function hideGrid() {
    grid.style.display = 'none';
    return rtn;
  }

  function hideLabels() {
    labels.style.display = 'none';
    return rtn;
  }

  function zoom(scale: number) {
    content.setAttribute('transform', `scale(${scale})`);
    return rtn;
  }

  function pan(x: number, y: number) {
    const currentTransform = content.getAttribute('transform') || '';
    content.setAttribute('transform', `${currentTransform} translate(${x}, ${y})`);
    return rtn;
  }

  function snap(enable: boolean) {
    if (enable) {
      content.setAttribute('data-snap', 'true');
      // 实现网格吸附逻辑
      content.addEventListener('mousemove', (e) => {
        const rect = content.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) / unit) * unit;
        const y = Math.round((e.clientY - rect.top) / unit) * unit;
        content.setAttribute('transform', `translate(${x}, ${y})`);
      });
    } else {
      content.removeAttribute('data-snap');
    }
    return rtn;
  }

  function exportSVG() {
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(group);
    return 'data:image/svg+xml;base64,' + btoa(source);
  }

  function addMarker(x: number, y: number, options: {
    type?: 'circle' | 'cross' | 'square',
    size?: number,
    color?: string
  } = {}) {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const { type = 'circle', size = 5, color = 'black' } = options;

    switch (type) {
      case 'circle':
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute('cx', x.toString());
        circle.setAttribute('cy', y.toString());
        circle.setAttribute('r', size.toString());
        circle.setAttribute('fill', color);
        marker.appendChild(circle);
        break;
      // 可以添加其他类型的标记
    }

    content.appendChild(marker);
    return rtn;
  }

  function addText(x: number, y: number, text: string, options: {
    size?: number,
    color?: string,
    anchor?: 'start' | 'middle' | 'end'
  } = {}) {
    const { size = 12, color = 'black', anchor = 'middle' } = options;
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute('x', x.toString());
    textElement.setAttribute('y', y.toString());
    textElement.setAttribute('font-size', size.toString());
    textElement.setAttribute('fill', color);
    textElement.setAttribute('text-anchor', anchor);
    textElement.textContent = text;
    content.appendChild(textElement);
    return rtn;
  }

  function theme(name: 'light' | 'dark') {
    setTheme(name);
    const theme = getTheme();
    
    // 应用主题到坐标系
    group.style.background = theme.colors.background;
    
    // 网格样式
    gridStyle({ 
      color: theme.colors.grid,
      width: theme.sizes.grid,
      opacity: theme.opacity.grid 
    });
    
    // 坐标轴样式
    axisStyle({ 
      color: theme.colors.axis,
      width: theme.sizes.axis 
    });
    
    // 文本样式
    labels.childNodes.forEach(node => {
      const text = node as SVGTextElement;
      text.setAttribute('fill', theme.colors.text);
    });
    
    return rtn;
  }

  return rtn;
}