import React, { Component } from 'react';
import { render } from 'react-dom';
import StockList from './Components/StockList';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div>
                <StockList items={this.state.items} />
            </div>
        );
    }
}

render(<App />, document.getElementById('root'));
