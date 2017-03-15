
class MobileButtons extends React.Component {

  getDefaultProps () {
    return {
      playStoreLink: "https://play.google.com/store/apps/details?id=org.refugerestrooms",
      appleStoreLink: "https://itunes.apple.com/us/app/refuge-restrooms/id968531953?mt=8",
    }
  }

  render () {
    return (
      <div className="row">
        <div className="col-xs-6 col-sm-4 col-sm-offset-2 col-md-2 col-md-offset-4">
          <a href={this.props.appleStoreLink}>
            <img src={this.props.itunesImgSrc} />
          </a>
        </div>

        <div className="col-xs-6 col-sm-4 col-md-2">
          <a href={this.props.playStoreLink}>
            <img src={this.props.googleImageSrc} />
          </a>
        </div>
      </div>
    );
  }
}

MobileButtons.propTypes = {
  itunesImgSrc: React.PropTypes.string,
  googleImgSrc: React.PropTypes.string,
};
