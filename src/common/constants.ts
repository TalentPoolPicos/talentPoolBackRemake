import * as path from 'path';
import * as os from 'os';

export const dataPath = path.join(os.homedir(), 'talent_pool_data', 'uploads');
export const publicPath = path.join(dataPath, 'public');
export const privatePath = path.join(dataPath, 'private');
export const profilePicturePath = path.join(publicPath, 'images');
