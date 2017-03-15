class AddRestroomButton extends React.Component {
  render () {
    return (
      <a href={this.props.href} className="btn btn-lg btn-purple splash-add-restroom-btn">
        Add A Restroom
        <i className="fa fa-plus-square-o fa-2x"></i>
      </a>
    );
  }
}

Splash.propTypes = {
};
