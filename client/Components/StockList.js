import React, { Component } from 'react';
import axios from 'axios';

const quotes = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22YHOO%22%2C%22AAPL%22%2C%22GOOG%22%2C%22MSFT%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';


class StockList extends Component {
    constructor() {
        super();

        this.state = {
            stock: [
                {
                    id: 1,
                    symbol: 'DOW J',
                    Ask: '22871.72',
                    ChangeinPercent: '+30.71',
                },
                {
                    id: 2,
                    symbol: 'AAPL',
                    Ask: '156.99',
                    ChangeinPercent: '+0.99',
                },
                {
                    id: 3,
                    symbol: 'SBUX',
                    Ask: '55.72',
                    ChangeinPercent: '-0.25',
                },
            ],
            qty: {},
            wallet: 5000,
            myShares: {
                AAPL: 3,
            },
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleBuy = this.handleBuy.bind(this);
        this.handleSell = this.handleSell.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.netTotal = this.netTotal.bind(this);
    }

    componentDidMount() {
        // Load needed API for stocks
        axios.get(quotes)
            .then((response) => {
                const stock = response.data.query.results.quote;
                this.setState({
                    stock,
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    getValueBySymbol(symbol) {
        const value = this.state.qty[symbol];
        return value || 0;
    }

    getTotal() {
        let total = 0;
        this.state.stock.forEach(
            (item) => {
                total += Number(item.Ask) * this.getValueBySymbol(item.symbol);
            },
        );
        return total;
    }

    // Apdate qty number onChange
    handleChange(e) {
        this.setState({
            qty: {
                ...this.state.qty,
                [e.target.getAttribute('data-symbol')]: Number(e.target.value),
            },
        });
    }

    // Update walet, shares on clicking Buy button
    handleBuy(e) {
        e.preventDefault();

        if ((this.state.wallet > 0) && (this.state.wallet >= this.getTotal())) {
            const myNewShare = {
                ...this.state.myShares,
            };

            // Extend myShares object with qty object
            Object.keys(this.state.qty).forEach((key) => {
                if (this.state.qty[key] <= 0) { return; }
                if (myNewShare[key]) {
                    myNewShare[key] += this.state.qty[key];
                } else {
                    myNewShare[key] = this.state.qty[key];
                }
            });

            this.setState({
                wallet: (this.state.wallet - this.getTotal()),
                myShares: myNewShare,
                qty: 0,
            });
        } else {
            alert('You do not have enougth money');

            this.setState({
                qty: 0,
            });
        }
    }

    // Update walet, shares on clicking Sell button
    handleSell(e) {
        e.preventDefault();

        if (Object.keys(this.state.myShares).length > 0) {
            const myNewShare = {
                ...this.state.myShares,
            };

            // Remove qty object from myShares object
            Object.keys(myNewShare).forEach((key) => {
                if (this.state.qty[key] && (myNewShare[key] >= this.state.qty[key])) {
                    myNewShare[key] -= this.state.qty[key];
                    if (myNewShare[key] === 0) {
                        delete myNewShare[key];
                    }

                    this.setState({
                        wallet: (this.state.wallet + this.getTotal()),
                        myShares: myNewShare,
                        qty: 0,
                    });
                } else {
                    // TODO: check whay it appiers when we
                    // sell when have more than one different shares
                    alert('You do not have such to sell');

                    this.setState({
                        qty: 0,
                    });
                }
            });
        } else {
            alert('You do not have such to sell');

            this.setState({
                qty: 0,
            });
        }
    }

    handleAdd(e) {
        e.preventDefault();
        this.setState({
            wallet: this.state.wallet + Number(document.getElementById('add-cash-amount').value),

        });
    }

    // Get Net total for myShares
    netTotal() {
        let myNetTotal = 0;
        Object.keys(this.state.myShares).forEach((key) => {
            const aa = this.state.stock.find(stock => stock.symbol === key);
            myNetTotal += aa.Ask * this.state.myShares[key];
        });
        return myNetTotal;
    }

    renderShares() {
        const shares = this.state.myShares;
        let mySharesDOM = '';
        if (Object.keys(this.state.myShares).length > 0) {
            Object.keys(shares).map(key => (mySharesDOM += `${key} - ${shares[key]};`),
            );
        } else {
            mySharesDOM = 0;
        }

        return mySharesDOM;
    }

    render() {
        const stock = this.state.stock;

        return (
            <div>
                <header>
                    <h3>Net total: {this.netTotal().toFixed(2)}</h3>
                    My A$: <b>{ this.state.wallet.toFixed(2) } </b> |
                    My Shares: <b>{this.renderShares()}</b>
                </header>
                <form action="">
                    <ul>
                        {stock.map((item, i) => (
                            <li key={item.symbol}>
                                <span><b>{item.symbol} </b></span>
                                <span className="stock-cost">{item.Ask} </span>
                                <span className="stock-change">{item.ChangeinPercent}</span>
                                <input
                                    name={`qty${i}`}
                                    type="number"
                                    value={this.getValueBySymbol(item.symbol)}
                                    placeholder="0"
                                    min="0"
                                    data-symbol={item.symbol}
                                    onChange={this.handleChange}
                                />
                                <span className="subtotal">
                                    {(this.getValueBySymbol(item.symbol) * item.Ask).toFixed(2)}
                                </span>
                            </li>
                        ))}
                        <h3 className="total">
                            {`Total: ${this.getTotal().toFixed(2)}` }
                        </h3>
                    </ul>
                    <button onClick={this.handleBuy} id="buy">Buy</button>
                    <button onClick={this.handleSell} id="sell">Sell</button>
                </form>
                <h3>Add cash to my account</h3>
                <form action="">
                    <input
                        id="add-cash-amount"
                        name="my-cash"
                        type="number"
                        placeholder="100"
                        min="0"
                    />
                    <button onClick={this.handleAdd} id="add-cash">Add</button>
                </form>
            </div>
        );
    }
}

export default StockList;
