#OpenSCAD Polygon Calculator

Enabling convenient conversions between relative measurements and absolute coordinates in Openscad.

![Preview](https://ben-z.github.io/assets/Polygon-Calculator-Result.png)

Access the application [here](https://ben-z.github.io/OpenSCAD-Polygon-Calculator).

Example code:

```openscad
// Paste in the bottom-left box and click "Compiled -> Coordinates"
polygon(
	points=[
		[0.00000, 0.00000]
		,[11.75000, 0.00000]
		,[11.75000, 115.15000]
		,[7.45000, 115.15000]
		,[-6.00000, 92.68000]
		,[-6.00000, 67.83000]
		,[0.00000, 67.83000]
		,[0.00000, 0.00000]
	]
	,paths=[[0, 1, 2, 3, 4, 5, 6, 7]]
);
```

Read this [blog post](https://ben-z.github.io/openscad/reactjs/2015/04/12/openscad-polygon-calculator/) about OpenSCAD Polygon Calculator.

*TODO: complete README.md*