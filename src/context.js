import React, { Component } from 'react';
import { storeProducts, detailProduct } from './data';

const ProductContext = React.createContext();

class ProductProvider extends Component {
    state = {
        products: [],
        detailProduct: detailProduct,
        cart: [],
        modalOpen: false,
        modalProduct: detailProduct,
        cartSubtotal: 0,
        cartTax: 0,
        cartTotal: 0
    }
    componentDidMount() {
        this.setProducts();
    }
    setProducts = () => {
        let products = [];
        storeProducts.forEach((item) => {
            const singleItem = {...item};
            products = [...products, singleItem];
        });
        this.setState(() => {
            return {products};
        });
    };

    getProduct = (id) => {
        return this.state.products.find(p => p.id === id);        
    }

    handleDetail = (id) => {
        const product = this.getProduct(id);
        this.setState( () => {
            return {detailProduct: product}
        });
    };
    addToCart = (id) => {
        let tempProducts = [...this.state.products];
        const index = tempProducts.findIndex(p => p.id === id);
        const product = tempProducts[index];
        product.inCart = true;
        product.count = 1;
        const price = product.price;
        product.total = price;

        this.setState(() => {
            return {
                products: tempProducts,
                cart: [...this.state.cart, product]
            }
        }, () => this.addTotals());
    };

    openModal = (id) => {
        const product = this.getProduct(id);
        this.setState({
            modalProduct: product,
            modalOpen: true
        });
    }
    closeModal = () => {
        this.setState({
            modalOpen: false
        });
    }

    increment = (id) => {
        let tempCart = [...this.state.cart];
        const product = tempCart.find(p => p.id === id);

        product.count++;
        product.total = product.count * product.price;

        this.setState({
            cart: [...tempCart]
        }, () => this.addTotals());
    }
    decrement = (id) => {
        let tempCart = [...this.state.cart];
        const product = tempCart.find(p => p.id === id);
       
        product.count--;
        if(product.count === 0){
            this.removeItem(id);
            return;
        }
        product.total = product.count * product.price;

        this.setState({
            cart: [...tempCart]
        }, () => this.addTotals());
    }
    removeItem = (id) => {
        let tempProducts = [...this.state.products];
        let tempCart = [...this.state.cart];

        tempCart = tempCart.filter(item => item.id !== id);
        const index = tempProducts.findIndex(p => p.id === id);
        let removedItem = tempProducts[index];
        removedItem.inCart = false;
        removedItem.count = 0;
        removedItem.total = 0;

        this.setState({
            cart: [...tempCart],
            products: [...tempProducts]
        }, () => this.addTotals());
    }
    clearCart = () => {
        this.setState({cart: []}, () => {
            this.setProducts();
            this.addTotals();
        });
    }
    addTotals = () => {
        let subtotal = 0;
        this.state.cart.forEach(item => (subtotal += item.total));
        const tempTax = subtotal * 0.1;
        const tax = parseFloat(tempTax.toFixed(2));
        const total = subtotal + tax;
        this.setState({
            cartSubtotal: subtotal,
            cartTax: tax,
            cartTotal: total
        });
    }
    render() {
        return (
            <ProductContext.Provider value={{
                ...this.state,
                handleDetail: this.handleDetail,
                addToCart: this.addToCart,
                openModal: this.openModal,
                closeModal: this.closeModal,
                increment: this.increment,
                decrement: this.decrement,
                removeItem: this.removeItem,
                clearCart: this.clearCart
            }}>
                {this.props.children}
            </ProductContext.Provider>
        )
    }
}

const ProductConsumer = ProductContext.Consumer;

export {ProductProvider, ProductConsumer};