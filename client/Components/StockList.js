import React, { Component } from 'react';
import axios from 'axios';
import { Row, Col, Button, ButtonToolbar,
    ListGroup, ListGroupItem, Well, Form,
    FormGroup, FormControl, InputGroup,
    ControlLabel, Label } from 'react-bootstrap';

const quotes = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22YHOO%22%2C%22AAPL%22%2C%22GOOG%22%2C%22MSFT%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';

class StockList extends Component {
    constructor() {
        super();
        // Using localStorage to store state
        const cachedStates = localStorage.getItem('state');
        if (cachedStates) {
            this.state = JSON.parse(cachedStates);
        } else {
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
                wallet: 0,
                myShares: {},
            };
        }

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

    componentDidUpdate() {
        localStorage.setItem('state', JSON.stringify(this.state));
    }

    getValueBySymbol(symbol) {
        const value = this.state.qty[symbol];
        return value || 0;
    }

    // Show total sum when select qty
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

    // When clicking Buy button update myShares and wallet
    handleBuy(e) {
        e.preventDefault();

        // Check if enougth money to buy
        if (this.state.wallet >= this.getTotal()) {
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

    // When click sell button update myShares and wallet
    handleSell(e) {
        e.preventDefault();

        const myNewShare = {
            ...this.state.myShares,
        };

        // Check if selling shares are exist in myShares
        Object.keys(this.state.qty).forEach((key) => {
            if (this.state.qty[key] === 0) { return; }
            if (myNewShare[key] >= this.state.qty[key]) {
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
                alert('You do not have such to sell');

                this.setState({
                    qty: 0,
                });
            }
        });
    }

    // Add cash to account
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

    // Render myShares on the page
    renderShares() {
        const shares = this.state.myShares;
        let mySharesDOM = '';
        if (Object.keys(this.state.myShares).length > 0) {
            mySharesDOM = Object.keys(shares)
                .map(key => <span>{`${key} - ${shares[key]}`}; </span>);
        } else {
            mySharesDOM = 0;
        }

        return mySharesDOM;
    }


    render() {
        const stock = this.state.stock;

        return (
            <Well>
                <header>
                    My A$: <Label bsStyle="success">{this.state.wallet.toFixed(2)}</Label> |
                    My Shares: <Label bsStyle="primary">{this.renderShares()}</Label> |
                    Net Total: <Label bsStyle="primary">{this.netTotal().toFixed(2)}</Label>
                </header>
                <h3>Add cash to my account</h3>
                <Form inline action="">
                    <FormGroup>
                        <InputGroup>
                            <FormControl
                                id="add-cash-amount"
                                name="my-cash"
                                type="number"
                                placeholder="100"
                                min="0"
                            />
                            <InputGroup.Button>
                                <Button bsStyle="primary" onClick={this.handleAdd} id="add-cash">Add</Button>
                            </InputGroup.Button>
                        </InputGroup>
                    </FormGroup>
                </Form>
                <h3>Stocks data</h3>
                <Form action="">
                    <FormGroup>
                        <ListGroup>
                            <ListGroupItem>
                                <Row>
                                    <Col xs={4}><h5>Stock info</h5></Col>
                                    <Col xs={4}><h5>Qty</h5></Col>
                                    <Col xs={4}><h5>Subtotal</h5></Col>
                                </Row>
                            </ListGroupItem>
                            {stock.map((item, i) => (
                                <ListGroupItem key={item.symbol}>
                                    <Row>
                                        <Col xs={4}>
                                            <ControlLabel htmlFor={`qty-${i}`}>
                                                <span><b>{item.symbol} </b></span>
                                                <span className="stock-cost">{item.Ask} </span>
                                                <span className="stock-change">{item.ChangeinPercent}</span>
                                            </ControlLabel>
                                        </Col>
                                        <Col xs={4}>
                                            <FormControl
                                                id={`qty-${i}`}
                                                name={`qty${i}`}
                                                type="number"
                                                value={this.getValueBySymbol(item.symbol)}
                                                placeholder="0"
                                                min="0"
                                                data-symbol={item.symbol}
                                                onChange={this.handleChange}
                                            />
                                        </Col>
                                        <Col xs={4}>
                                            <span className="subtotal">
                                                {(this.getValueBySymbol(item.symbol) * item.Ask).toFixed(2)}
                                            </span>
                                        </Col>
                                    </Row>
                                </ListGroupItem>
                        ))}
                            <h3 className="total">
                                {`Total: ${this.getTotal().toFixed(2)}` }
                            </h3>
                        </ListGroup>
                    </FormGroup>
                    <ButtonToolbar>
                        <Button bsStyle="primary" onClick={this.handleBuy} id="buy">Buy</Button>
                        <Button bsStyle="success" onClick={this.handleSell} id="sell">Sell</Button>
                    </ButtonToolbar>
                </Form>
            </Well>
        );
    }
}

export default StockList;
