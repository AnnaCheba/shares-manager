import React, { Component } from 'react';
import 'rxjs';
import { render } from 'react-dom';
import PropTypes from 'prop-types';
import StockList from './Components/StockList';

// import { Provider } from 'react-redux';
// import store from './store';

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

StockList.propTypes = {
    items: PropTypes.array,
};

render(<App />, document.getElementById('root'));
