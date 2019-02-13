import AssetLoader from 'ember-asset-loader/services/asset-loader'
import AssetLoadError from 'ember-asset-loader/errors/asset-load'
import ENV from '../config/environment'

export function RETRY_LOAD_SECRET() { }

export default AssetLoader.extend({
    rooturl: ENV.rootURL,

    loadAsset({ uri, type }, retryLoad) {
        let new_uri = uri.replace(/\\/g, '/');
        if (this.get('rooturl') === "/") {
           }
        else {
            new_uri = '/' + this.get('rooturl').replace(/\//g, "") + new_uri;
        }
        
        const cacheKey = `${type}:${new_uri}`;
        
        const cachedPromise = this._getFromCache('asset', cacheKey, retryLoad === RETRY_LOAD_SECRET);
    
        if (cachedPromise) {
            return cachedPromise;
        }
    
        const loader = this._getAssetLoader(type);
        const assetPromise = loader(new_uri);
    
        const assetWithFail = assetPromise.then(
            () => ({ new_uri, type }),
            (error) => {
            throw new AssetLoadError(this, { new_uri, type }, error);
            }
        );
    
        return this._setInCache('asset', cacheKey, assetWithFail);
    },
});