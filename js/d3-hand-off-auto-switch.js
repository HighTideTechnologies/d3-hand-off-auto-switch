class HandOffAuto {
  constructor(container, config) {
    this.container = container;

    let defaults = {
      defaultWidth: 50,
      defaultHeight: 55,
      switchType: 'handOffAuto',
      fontSize: 10,
      fontFamily: 'Helvetica',
      fontColor: '#fafafa',
      fontWeight: 'bold',
      handLabelText: 'H',
      offLabelText: 'O',
      autoLabelText: 'A',
      manualLabelText: 'M',
      borderColor: '#fafafa',
      fillColor: '#333',
      borderWidth: 1,
      switchKnobWidth: 5,
      switchKnobFillColor: '#949494',
      switchKnobBorderColor: '#333',
      markerColor: 'red',
      switchPosition: 'auto',
      markerPositionAngle: 45
    };
    Object.assign(this, defaults, config);

    this.init();
  }

  init() {
    this.drawSvg();
    this.initSwitch();
    this.setLabelAttributes();
    this.getHeightsOfLabels();
    this.calculateDimensions();
    this.calculatePositionsofLabels();
    this.applySwitchAttributes();
    this.repositionElements();
    this.addTooltip();
    this.setPosition(this.switchPosition);
    this.hover();
  }

  drawSvg() {
    // this.width = this.container.outerWidth();
    // this.height = this.container.outerHeight();

    if (this.width === 0 || this.height === 0 || typeof this.width === 'undefined' || typeof this.height === 'undefined' || this.width === 'null' || this.height === 'null') {
      this.width = this.defaultWidth;
      this.height = this.defaultHeight;
    }

    let viewBoxDef = `0, 0, ${this.width}, ${this.height}`;

    this.svgContainer = d3.select(this.container[0])
      .append("svg")
      .attr('id', 'svg-container')
      .attr('class', 'hand-off-auto')
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("viewBox", viewBoxDef);

    this.bodyGroup = this.svgContainer.append('g')
      .attr('id', 'body-group')
      .attr('transform', `translate(${this.width/2}, ${this.height/2})`);
  }

  initSwitch() {
    this.switchGroup = this.bodyGroup.append('g').attr('id', 'switch-group');
    this.switchBody = this.switchGroup.append('circle').attr('id', 'switch-body');
    if ( this.switchType === 'handOffAuto' ) {
      this.handLabel = this.switchGroup.append('text').attr('id', 'hand-label');
      this.offLabel = this.bodyGroup.append('text').attr('id', 'off-label');
      this.autoLabel = this.switchGroup.append('text').attr('id', 'auto-label');
    } else if ( this.switchType === 'manualAuto' ) {
      this.manualLabel = this.switchGroup.append('text').attr('id', 'manual-label');
      this.autoLabel = this.switchGroup.append('text').attr('id', 'auto-label');
    }
    this.switchKnob = this.switchGroup.append('circle').attr('id', 'switch-knob');
    this.rotateGroup = this.switchGroup.append('g').attr('id', 'rotate-group').datum({ angle: 0 });
    this.switchKnobHandle = this.rotateGroup.append('rect').attr('id', 'switch-knob-handle');
    this.switchKnobMarker = this.rotateGroup.append('line').attr('id', 'switch-knob-marker');
  }

  setLabelAttributes() {
    if ( this.switchType === 'handOffAuto' ) {
      this.applyAttributes(this.handLabel, {
        'text-anchor': 'middle',
        'font-family': this.fontFamily,
        'font-size': `${this.fontSize}px`,
        fill: this.fontColor,
        'font-weight': this.fontWeight,
        text: this.handLabelText
      });
      this.applyAttributes(this.offLabel, {
        'text-anchor': 'middle',
        'font-family': this.fontFamily,
        'font-size': `${this.fontSize}px`,
        fill: this.fontColor,
        'font-weight': this.fontWeight,
        text: this.offLabelText
      });
      this.applyAttributes(this.autoLabel, {
        'text-anchor': 'middle',
        'font-family': this.fontFamily,
        'font-size': `${this.fontSize}px`,
        fill: this.fontColor,
        'font-weight': this.fontWeight,
        text: this.autoLabelText
      });
    } else if ( this.switchType === 'manualAuto' ) {
      this.applyAttributes(this.manualLabel, {
        'text-anchor': 'middle',
        'font-family': this.fontFamily,
        'font-size': `${this.fontSize}px`,
        fill: this.fontColor,
        'font-weight': this.fontWeight,
        text: this.manualLabelText
      });
      this.applyAttributes(this.autoLabel, {
        'text-anchor': 'middle',
        'font-family': this.fontFamily,
        'font-size': `${this.fontSize}px`,
        fill: this.fontColor,
        'font-weight': this.fontWeight,
        text: this.autoLabelText
      });
    }
  }

  getHeightsOfLabels() {
    if (this.switchType === 'handOffAuto') {
      this.handLabelHeight = this.handLabel.node().getBBox().height;
      this.offLabelHeight = this.offLabel.node().getBBox().height;
      this.autoLabelHeight = this.autoLabel.node().getBBox().height;
    } else if (this.switchType === 'manualAuto') {
      this.manualLabelHeight = this.manualLabel.node().getBBox().height;
      this.autoLabelHeight = this.autoLabel.node().getBBox().height;
    }
  }

  calculateDimensions() {
    if (this.switchType === 'handOffAuto') {
      this.switchRadius = Math.min((this.width-this.borderWidth)/2, (this.height - this.offLabelHeight - Math.max(this.handLabelHeight, this.autoLabelHeight))/2);
    } else if (this.switchType === 'manualAuto') {
      this.switchRadius = Math.min((this.width-this.borderWidth)/2, (this.height - this.manualLabelHeight - Math.max(this.manualLabelHeight, this.autoLabelHeight))/2);
    }
    this.switchKnobRadius = this.switchRadius/2;
  }

  calculatePositionsofLabels() {
    let distance = (this.switchRadius + this.borderWidth*2 + 3);

    if (this.switchType === 'handOffAuto') {
      this.handLabelXPos = -(Math.cos( (90 - this.markerPositionAngle)/360*(2*Math.PI) ) * distance);
      this.handLabelYPos = -(Math.sin( (90 - this.markerPositionAngle)/360*(2*Math.PI) ) * distance);
      this.autoLabelXPos = -this.handLabelXPos;
      this.autoLabelYPos = this.handLabelYPos;
    } else if (this.switchType === 'manualAuto') {
      this.manualLabelXPos = -(Math.cos( (90 - this.markerPositionAngle)/360*(2*Math.PI) ) * distance);
      this.manualLabelYPos = -(Math.sin( (90 - this.markerPositionAngle)/360*(2*Math.PI) ) * distance);
      this.autoLabelXPos = -this.manualLabelXPos;
      this.autoLabelYPos = this.manualLabelYPos;
    }
  }

  applySwitchAttributes() {
    this.applyAttributes(this.switchBody, {
      cx: 0,
      cy: 0,
      r: this.switchRadius,
      stroke: this.borderColor,
      'stroke-width': this.borderWidth,
      fill: this.fillColor
    });

    this.switchKnobWidth = this.switchRadius/3;
    this.applyAttributes(this.switchKnobHandle, {
      width: this.switchKnobWidth,
      height: 2*this.switchRadius,
      stroke: this.switchKnobBorderColor,
      'stroke-width': this.borderWidth,
      fill: this.switchKnobFillColor
    });

    this.applyAttributes(this.switchKnobMarker, {
      x1: 0,
      x2: 0,
      y1: 0,
      y2: this.switchRadius/2,
      stroke: this.markerColor,
      'stroke-width': this.switchKnobWidth/4
    });
  }

  applyAttributes(selection, datum = {}) {
    let properties = Object.getOwnPropertyNames(datum);
    properties.forEach((p) => {
      if (p === 'datum') {
        return selection.datum( datum[p] );
      } else if (p === 'text') {
        return selection.text( datum[p] );
      } else if (p === 'style') {
        return selection.style( datum[p] );
      } else {
        return selection.attr( p, datum[p] );
      }
    });
  }

  repositionElements() {
    let switchBodyHeight = this.switchBody.node().getBBox().height;

    if (this.switchType === 'handOffAuto') {
      let handDef = `translate(${this.handLabelXPos}, ${this.handLabelYPos})`;
      let offDef = `translate(0, ${-(this.height/2 - this.offLabelHeight)})`;
      let autoDef = `translate(${(this.autoLabelXPos)}, ${this.autoLabelYPos})`;
      let switchGroupDef = `translate(0, ${-(this.height/2 - this.switchRadius - this.borderWidth*2 - 3) + this.offLabelHeight})`;
      let switchHandleDef = `translate(${-this.switchKnobWidth/2}, ${-this.switchRadius - 3})`;
      let switchMarkerDef = `translate(0, ${-this.switchRadius - 1})`;

      this.switchGroup.attr('transform', switchGroupDef);
      this.switchKnobHandle.attr('transform', switchHandleDef);
      this.switchKnobMarker.attr('transform', switchMarkerDef);
      this.handLabel.attr('transform', handDef);
      this.offLabel.attr('transform', offDef);
      this.autoLabel.attr('transform', autoDef);
    } else if (this.switchType === 'manualAuto') {
      let manualDef = `translate(${this.manualLabelXPos}, ${this.manualLabelYPos})`;
      let autoDef = `translate(${(this.autoLabelXPos)}, ${this.autoLabelYPos})`;
      let switchGroupDef = `translate(0, ${-(this.height/2 - this.switchRadius - this.borderWidth*2 - 3) + this.manualLabelHeight - 1})`;
      let switchHandleDef = `translate(${-this.switchKnobWidth/2}, ${-this.switchRadius - 3})`;
      let switchMarkerDef = `translate(0, ${-this.switchRadius - 1})`;

      this.switchGroup.attr('transform', switchGroupDef);
      this.switchKnobHandle.attr('transform', switchHandleDef);
      this.switchKnobMarker.attr('transform', switchMarkerDef);
      this.manualLabel.attr('transform', manualDef);
      this.autoLabel.attr('transform', autoDef);
    }
  }
  
  addTooltip() {
    this.tooltip = d3.select(this.container[0]).append('div')
      .style('position', 'absolute')
      .style('padding', '8px')
      .style('background', 'rgba(97,97,97,0.9)')
      .style('color', '#fff')
      .style('font-family', "'Roboto', 'Helvetica', 'Arial', sans-serif")
      .style('font-size', '10px')
      .style('-webkit-animation', 'pulse 200ms cubic-bezier(0, 0, 0.2, 1) forwards')
      .style('animation', 'pulse 200ms cubic-bezier(0, 0, 0.2, 1) forwards');
  }
  
  repositionTooltip() {
    this.tooltip.style('display', 'initial');
    
    let width = this.width/2 - (Math.max(this.tooltip.node().offsetWidth, this.tooltip.node().clientWidth))/2;
    let height = Math.max(this.tooltip.node().offsetHeight, this.tooltip.node().clientHeight)
    
    this.tooltip
      .style('left', `${width}px`)
      .style('top', `${-height*4/3}px`)
      .style('display', 'none');
  }

  setPosition(val) {
    this.switchPosition = val;

    if (this.switchType === 'handOffAuto') {
      if (val === 'hand') {
        this.tweenElement(-this.markerPositionAngle);
      } else if (val === 'off') {
        this.tweenElement(0);
      } else if (val === 'auto') {
        this.tweenElement(this.markerPositionAngle);
      }
    } else if (this.switchType === 'manualAuto') {
      if (val === 'manual') {
        this.tweenElement(-this.markerPositionAngle);
      } else if (val === 'auto') {
        this.tweenElement(this.markerPositionAngle);
      }
    }
    
    let capitalizedPos = this.switchPosition.charAt(0).toUpperCase() + this.switchPosition.slice(1);
    
    this.tooltip
      .datum({ label: capitalizedPos })
      .html(function(d) { return '<div>' + d.label + '</div>'; });
    
    this.repositionTooltip();
  }

  tweenElement(val) {
    this.rotateGroup
      .transition()
      .duration(500)
      .ease(d3.easePolyInOut.exponent(4))
      .attrTween('transform', function(d) {
      let interpolator = d3.interpolateNumber(d.angle, val);

      return function(t) {
        d.angle = interpolator(t);
        return `rotate(${d.angle})`;
      }
    });
  }

  hover() {
    d3.select(this.svgContainer.node()).on('mouseleave', () => {
      this.tooltip.style('display', 'none');
    });
    d3.select(this.svgContainer.node()).on('mouseenter', () => {
      this.tooltip.style('display', 'initial');
    });
  }

  click(callback) {
    if ( typeof callback !== "function" ) {
      throw new Error("argument must be a function");
    }
    this.svgContainer.on("click", callback);
  }

  destroy() {
    this.svgContainer.remove();
  }

  redraw() {
    this.destroy();
    this.init();
  }
}