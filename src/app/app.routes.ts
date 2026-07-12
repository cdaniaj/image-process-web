import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./features/analysis/analysis.component').then(m => m.AnalysisComponent)
	}
];
