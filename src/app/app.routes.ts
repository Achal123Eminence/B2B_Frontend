import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { UsersList } from './components/users-list/users-list';
import { MotherPanelList } from './components/mother-panel-list/mother-panel-list';
import { CreateUser } from './components/create-user/create-user';
import { AddMotherPanel } from './components/add-mother-panel/add-mother-panel';
import { AddWebite } from './components/add-webite/add-webite';
import { GetWebsiteList } from './components/get-website-list/get-website-list';
import { GetBanners } from './components/get-banners/get-banners';
import { Inplay } from './components/inplay/inplay';

export const routes: Routes = [
    {path: '',redirectTo: 'login',pathMatch: 'full'},
    {path:'login',component:Login},
    {path:'home',component:Home},
    {path:'users-list',component:UsersList},
    {path:'mother-panel-list',component:MotherPanelList},
    {path:'create-user',component:CreateUser},
    {path:'add-mother-panel',component:AddMotherPanel},
    {path:'add-website/:panelId',component:AddWebite},
    {path:'website-list/:panelId',component:GetWebsiteList},
    {path:'get-banners/:panelDetailsId',component:GetBanners},
    {path:'inplay/:panelDetailsId',component:Inplay}
];
