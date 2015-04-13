// TODO: [-]1. Coordinate change listener
//       [-]2. Order change listener
//       [-]3. Remove coordinate
//       [-]4. 'disabled' class to order changers '-'
//       [-]]5. Canvas offset
//       [-]6. Breaks -replaced by 'N'ew coordinate UPDATE: replaced by coord.isNew
//       [-]7. Compile to compiled
//            7a. press enter for new coordinate
//          ---No need for raw 8. Compile to raw
//       [-]9. Read from compiled (button design)
//          DEPRECATED 10. Read from raw (button design)
//       TODO: 11. Zebra Style
//       [-]12. Colored button types
//       TODO: 13. Variables
//          14. Instructions
//       [-]15. Github banner
//          16. Publish

var App = React.createClass({
    getInitialState: function() {
        // Dynamically use default examples
        var defaultCoordinates = [
            [{"x":0,"y":0,"type":"A","isNew":true},{"x":100,"y":100,"type":"A","isNew":false}]
            ,[{"x":0,"y":0,"type":"A","isNew":true},{"x":11.75,"y":0,"type":"A","isNew":false},{"x":11.75,"y":115.15,"type":"A","isNew":false},{"x":7.45,"y":115.15,"type":"A","isNew":false},{"x":-6,"y":92.68,"type":"A","isNew":false},{"x":-6,"y":67.83,"type":"A","isNew":false},{"x":0,"y":67.83,"type":"A","isNew":false},{"x":0,"y":0,"type":"A","isNew":false}]
            ,[{"x":0,"y":0,"type":"A","isNew":true},{"x":100,"y":0,"type":"A","isNew":false},{"x":0,"y":100,"type":"A","isNew":false},{"x":0,"y":0,"type":"A","isNew":false},{"x":10,"y":10,"type":"A","isNew":true},{"x":80,"y":10,"type":"A","isNew":false},{"x":10,"y":80,"type":"A","isNew":false},{"x":10,"y":10,"type":"A","isNew":false}]
        ];
        
        var random = Math.floor((Math.random() * (defaultCoordinates.length)));
        
        if(typeof(Storage) !== "undefined") {
            var coordinates = JSON.parse(localStorage.getItem("coordinates")) || defaultCoordinates[random];
        } else {
            var coordinates = defaultCoordinates[random];
        }
        var compiled = this._compileStr(coordinates);
        
        return {
            // A = Absolute, D = Difference, N = New coordinate (Absolute)
            coordinates: coordinates,
            compiled: compiled,
            raw: null // Deprecated
        };
    },
    _handleCompiledChange: function(){
        this.setState({
            compiled: this.refs.compiled.getDOMNode().value
        });
    },
    _handleRawChange: function(){
        this.setState({
            raw: this.refs.raw.getDOMNode().value
        });
    },
    _handleTypeChange: function(e){
//        console.log(e.target);
        var count=e.target.parentNode.getAttribute('data-count');
        var currentType = e.target.getAttribute('data-type');
        var coordinates = this.state.coordinates;
        coordinates[count].type = (currentType === 'A')?'R':'A';
        this.setState({
            coordinates:coordinates,
            compiled: this._compileStr()
        });
    },
    _handleToggleNew: function(e){
        var count=e.target.parentNode.getAttribute('data-count');
        var isNew = e.target.getAttribute('data-isnew')==='true'?true:false;
        var coordinates = this.state.coordinates;
        coordinates[count].isNew = !isNew;
        this.setState({
            coordinates:coordinates,
            compiled: this._compileStr()
        });
    },
    _handleValChange: function(e){
//        console.log(e.target);
        var count=e.target.parentNode.getAttribute('data-count');
        var coordType = e.target.getAttribute('data-coordtype');
        var coordinates = this.state.coordinates;
        coordinates[count][coordType] = e.target.value;
        this.setState({
            coordinates: coordinates,
            compiled: this._compileStr()
        });
    },
    _handleMove: function(e){
//        console.log(e.target);
        var moveType = e.target.getAttribute('data-movetype');
        if(moveType==='disabled') return; // Return if element can't be moved
        var count=Number(e.target.parentNode.getAttribute('data-count'));
        var coordinates = this.state.coordinates;
        Array.prototype.swapItems = function(a, b){
//            var temp = this[a];
//            this[a] = this[b];
//            this[b] = temp;
            this[a] = this.splice(b, 1, this[a])[0];
            return this.filter(function(){return true;});;
        }
        coordinates.swapItems(count, (moveType==='up'?count-1:count+1));
        this.setState({
            coordinates: coordinates,
            compiled: this._compileStr()
        })
    },
    _handleRemove: function(e){
        var count=e.target.parentNode.getAttribute('data-count');
        var coordinates = this.state.coordinates;
        coordinates.splice(count, 1);
        this.setState({
            coordinates: coordinates,
            compiled: this._compileStr()
        })
    },
    _handleAdd: function(e){
        var coordinates = this.state.coordinates;
        var type = coordinates[coordinates.length-1]?coordinates[coordinates.length-1].type:'A';
        coordinates.push({x:0,y:0,type:type});
        this.setState({
            coordinates: coordinates,
            compiled: this._compileStr()
        });
    },
    _handleReadCompiled: function(){
        this._readCompiled(null, function(err, coords){
            if(err.length>0){
                err.forEach(function(data){
                    console.log(data.message);
                });
            }
            this.setState({
                coordinates: coords
            });
        }.bind(this));
    },
    _handleShowRelative: function(){
        var coords = this.state.coordinates;
        coords.forEach(function(c, i){
            if(c.type === 'A'){
                coords[i] = this._findRelative(null, i);
                coords[i].type = 'R';
                coords[i].isNew = c.isNew;
            }
        }, this);
        
        this.setState({
            coordinates: coords
        });
    },
    _handleShowAbsolute: function(){
        var coords = this.state.coordinates;
        coords.forEach(function(c, i){
            if(c.type === 'R'){
                coords[i] = this._findAbsolute(null, i);
                coords[i].type = 'A';
                coords[i].isNew = c.isNew;
            }
        }, this);
        
        this.setState({
            coordinates: coords
        });
    },
    _handleResetApp: function(){
        var r = confirm("Clear data and load a default example?");
        if(r){
            if(typeof(Storage) !== "undefined") {
                localStorage.clear();
            }
            location.reload();
        }
    },
    render: function() {
//        window.state = this.state;
        return(
            <div>
                <div className="tile-canvas"><canvas width="460px" height="460px">Your browser does not support HTML5 canvas</canvas></div>
                <div className="tile-coordinates">
                    <div className="toolbar">
                        <div className="add-coordinate" onClick={this._handleAdd}>Add a Coordinate</div>
                    </div>
                    <Coordinates coordinates={this.state.coordinates}
                                _handleTypeChange={this._handleTypeChange}
                                _handleValChange={this._handleValChange}
                                _handleMove={this._handleMove}
                                _handleRemove={this._handleRemove}
                                _handleToggleNew={this._handleToggleNew} />
                </div>
                <div className="tile-compiled">
                    <textarea ref="compiled" value={this.state.compiled} onChange={this._handleCompiledChange}></textarea>
                </div>
                <div className="tile-buttons">
                    <div className="buttons">
                        <div className="button" onClick={this._handleReadCompiled}>{'Compiled -> Coordinates'}</div>
                        <div className="button" onClick={this._handleShowRelative}>{'Show Relative Coordinates'}</div>
                        <div className="button" onClick={this._handleShowAbsolute}>{'Show Absolute Coordinates'}</div>
                        <div className="button" onClick={this._handleResetApp}>{'Reset Application*'}</div>
                    </div>
                    <textarea ref="raw" value={this.state.raw} onChange={this._handleRawChange}></textarea>
                </div>
            </div>
        );
    },
    _findAbsolute: function(coords, i){
        i = Number(i);
        var coord = coords || this.state.coordinates;
        var c = {x:Number(coord[i].x),y:Number(coord[i].y)};
        
        if(/[AN]/.test(coord[i].type) || i===0){
            return c;
        } else if(/[R]/.test(coord[i].type)){
            var lastAbsoluteC = this._findAbsolute(coords, i-1);
            c.x += lastAbsoluteC.x;
            c.y += lastAbsoluteC.y;
            return c;
        }
    },
    _findRelative: function(coords, i){
        i = Number(i);
        var coord = coords || this.state.coordinates;
        console.log(coord);
        var c = {x:Number(coord[i].x),y:Number(coord[i].y)};
        
        if(/[R]/.test(coord[i].type) || i===0){
            return c;
        } else if(/[AN]/.test(coord[i].type)){
            var lastAbsoluteC = this._findAbsolute(coords, i-1);
            c.x -= lastAbsoluteC.x;
            c.y -= lastAbsoluteC.y;
            return c;
        }
    },
    _compileArr: function(cArr){
        var cs = cArr || this.state.coordinates;
        var coordinates = [];
        var breaks = [];
        var bSetCount = -1;
        
        cs.forEach(function(c,i){
            var absc = this._findAbsolute(cArr, i);
            coordinates.push(absc);
            
            if(c.isNew || i===0){
                breaks.push([i]);
                bSetCount++;
            }else {
                breaks[bSetCount].push(i);
            }
        }, this);
        
        return {cs:coordinates, brs:breaks};
    },
    _compileStr: function(cArr){ //TODO: options: MINIFY, BEAUTIFY
        var arr = this._compileArr(cArr);
        
        var cs = arr.cs;
        var carr = [];
        cs.forEach(function(c,i){
            carr.push('['+Number(c.x).toFixed(5)+', '+Number(c.y).toFixed(5)+']');
        });
        var cstr = carr.join('\n\t\t,');
        
        var brs = arr.brs;
        var brarr = [];
        brs.forEach(function(br,i){
            brarr.push('['+br.join(', ')+']');
        });
        var brstr = brarr.join(', ');
        
        var str = 'polygon(\n\tpoints=[\n\t\t'+cstr+'\n\t]\n\t,paths=['+brstr+']\n);';
        
        return str;
    },
    _readCompiled: function(array, callback){
        var compiled = array || this.state.compiled;
        var replaceRegex = /([\n\t ()=;]|polygon|points|paths)/g;
        compiled = '[' + compiled.replace(replaceRegex,'').replace('NaN', null) + ']';
        compiled = eval(compiled);
//        console.log(compiled);
        var points = compiled[0];
        var paths = compiled[1];
        
        var coords = [];
        var err = [];
        paths.forEach(function(pathGroup, i){
            pathGroup.forEach(function(pathNum, n){
                var x = points[pathNum][0];
                var y = points[pathNum][1];
                if(x === null || y === null) err.push({message: 'Incomplete Coordinates'});
                var type = 'A';
                if(n === 0){
                    var isNew = true;
                }else{
                    var isNew = false;
                }
                coords.push({
                    x: x,
                    y: y,
                    type: type,
                    isNew: isNew
                });
            });
        });
        
        return callback(err, coords);
    },
    _drawCanvas: function(){
        this._compileArr();
//        console.log(this.state.coordinates);
        var canvas = document.getElementsByClassName("tile-canvas")[0].getElementsByTagName('canvas')[0];
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
//        ctx.moveTo(0,0);
        var offsetX = canvas.width/2;
        var offsetY = canvas.height/2;
        for(var i = 0; i < this.state.coordinates.length; i++){
            var c = this.state.coordinates[i];
            if(isNaN(c.x)||isNaN(c.y)){
                console.log('Incomplete coordinate(s)');
                break;
            }
            c.x = Number(c.x);
            c.y = Number(c.y);
            if(c.isNew){
                ctx.moveTo(c.x+offsetX, -c.y+offsetY);
            }else {
                c = this._findAbsolute(null, i);
                ctx.lineTo(c.x+offsetX, -c.y+offsetY);
            }
        }
        ctx.stroke();
    },
    componentDidUpdate: function(){
        this._drawCanvas();
        if(typeof(Storage) !== "undefined") {
            localStorage.setItem("coordinates", JSON.stringify(this.state.coordinates));
        }
    },
    componentDidMount: function(){
        this._drawCanvas();
    }
});

var Coordinates = React.createClass({
    propTypes: {
        coordinates: React.PropTypes.arrayOf(React.PropTypes.object),
        _handleToggleNew: React.PropTypes.func,
        _handleTypeChange: React.PropTypes.func,
        _handleValChange: React.PropTypes.func,
        _handleMove: React.PropTypes.func,
        _handleRemove: React.PropTypes.func
    },
    render: function(){
        var groups = [];
        this.props.coordinates.forEach(function(c, i){
            if(i===0 && i===this.props.coordinates.length-1){
                var disableMove = 'both';
            } else if(i===0){
                var disableMove = 'up';
            } else if(i===this.props.coordinates.length-1){
                var disableMove = 'down';
            } else {
                var disableMove = '';
            }
            groups.push(<Group 
                        x={String(c.x)} 
                        y={String(c.y)}
                        isNew={c.isNew}
                        type={c.type} 
                        count={i} 
                        _handleToggleNew={this.props._handleToggleNew}
                        _handleTypeChange={this.props._handleTypeChange}
                        _handleValChange={this.props._handleValChange}
                        _handleMove={this.props._handleMove}
                        disableMove={disableMove}
                        _handleRemove={this.props._handleRemove}
                        key={i}/>
                       );
        }, this);
        
        return (
            <div className="coordinates">
            {groups}
            </div>
        );
    }
});

var Group = React.createClass({
    propTypes: {
        x: React.PropTypes.string,
        y: React.PropTypes.string,
        isNew: React.PropTypes.bool,
        type: React.PropTypes.string,
        count: React.PropTypes.number,
        _handleToggleNew: React.PropTypes.func,
        _handleTypeChange: React.PropTypes.func,
        _handleValChange: React.PropTypes.func,
        _handleMove: React.PropTypes.func,
        disableMove: React.PropTypes.string,
        _handleRemove: React.PropTypes.func
    },
    render: function(){
//        this.props.x = isNaN(this.props.x)?this.props.x:Number(this.props.x).toFixed(5);
//        this.props.y = isNaN(this.props.y)?this.props.y:Number(this.props.y).toFixed(5);
        
        return (
            <div className="group" data-count={this.props.count}>
                <input type="text" data-coordtype="x" value={this.props.x} onChange={this.props._handleValChange}/>
                <input type="text" data-coordtype="y" value={this.props.y} onChange={this.props._handleValChange}/>
                <div className="new"
                    data-isnew={this.props.isNew?'true':'false'}
                    onClick={this.props._handleToggleNew}>N</div>
                <div className="type"
                    data-type={this.props.type}
                    onClick={this.props._handleTypeChange}>{this.props.type}</div>
                <div className="move" 
                    data-movetype={/(both|up)/.test(this.props.disableMove)?'disabled':'up'} 
                    onClick={this.props._handleMove}>&#x25B2;</div>
                <div className="move" 
                    data-movetype={/(both|down)/.test(this.props.disableMove)?'disabled':'down'} 
                    onClick={this.props._handleMove}>&#x25BC;</div>
                <div className="remove" onClick={this.props._handleRemove}>&#10005;</div>
            </div>
        );
    }
});

React.render(<App />, document.getElementsByClassName('app')[0]);