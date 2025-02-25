import React, { PureComponent } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import { connect } from 'react-redux';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import AddCustomToken from '../../UI/AddCustomToken';
import SearchTokenAutocomplete from '../../UI/SearchTokenAutocomplete';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import AddCustomCollectible from '../../UI/AddCustomCollectible';
import { getNetworkNavbarOptions } from '../../UI/Navbar';
import { NetworksChainId } from '@metamask/controllers';
import CollectibleDetectionModal from '../../UI/CollectibleDetectionModal';
import { isMainNet } from '../../../util/networks';

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colors.white,
	},
	infoWrapper: {
		alignItems: 'center',
		marginTop: 10,
	},
	tabUnderlineStyle: {
		height: 2,
		backgroundColor: colors.blue,
	},
	tabStyle: {
		paddingBottom: 0,
	},
	textStyle: {
		fontSize: 16,
		letterSpacing: 0.5,
		...fontStyles.bold,
	},
});

/**
 * PureComponent that provides ability to add assets.
 */
class AddAsset extends PureComponent {
	static navigationOptions = ({ navigation, route }) =>
		getNetworkNavbarOptions(
			`add_asset.${route.params.assetType === 'token' ? 'title' : 'title_nft'}`,
			true,
			navigation
		);

	state = {
		address: '',
		symbol: '',
		decimals: '',
		dismissNftInfo: false,
	};

	static propTypes = {
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object,
		/**
		 * Chain id
		 */
		chainId: PropTypes.string,
		/**
		 * Object that represents the current route info like params passed to it
		 */
		route: PropTypes.object,
		/**
		 * Boolean to show if NFT detection is enabled
		 */
		useCollectibleDetection: PropTypes.bool,
	};

	renderTabBar() {
		return (
			<DefaultTabBar
				underlineStyle={styles.tabUnderlineStyle}
				activeTextColor={colors.blue}
				inactiveTextColor={colors.fontTertiary}
				backgroundColor={colors.white}
				tabStyle={styles.tabStyle}
				textStyle={styles.textStyle}
			/>
		);
	}

	dismissNftInfo = async () => {
		this.setState({ dismissNftInfo: true });
	};

	render = () => {
		const {
			route: {
				params: { assetType, collectibleContract },
			},
			navigation,
			chainId,
			useCollectibleDetection,
		} = this.props;
		const { dismissNftInfo } = this.state;

		return (
			<SafeAreaView style={styles.wrapper} testID={`add-${assetType}-screen`}>
				{isMainNet(chainId) && assetType !== 'token' && !dismissNftInfo && !useCollectibleDetection && (
					<View style={styles.infoWrapper}>
						<CollectibleDetectionModal onDismiss={this.dismissNftInfo} navigation={navigation} />
					</View>
				)}
				{assetType === 'token' ? (
					<ScrollableTabView renderTabBar={this.renderTabBar}>
						{NetworksChainId.mainnet === this.props.chainId && (
							<SearchTokenAutocomplete
								navigation={navigation}
								tabLabel={strings('add_asset.search_token')}
								testID={'tab-search-token'}
							/>
						)}
						<AddCustomToken
							navigation={navigation}
							tabLabel={strings('add_asset.custom_token')}
							testID={'tab-add-custom-token'}
						/>
					</ScrollableTabView>
				) : (
					<AddCustomCollectible
						navigation={navigation}
						collectibleContract={collectibleContract}
						testID={'add-custom-collectible'}
					/>
				)}
			</SafeAreaView>
		);
	};
}

const mapStateToProps = (state) => ({
	chainId: state.engine.backgroundState.NetworkController.provider.chainId,
	useCollectibleDetection: state.engine.backgroundState.PreferencesController.useCollectibleDetection,
});

export default connect(mapStateToProps)(AddAsset);
