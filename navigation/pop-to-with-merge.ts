import { NavigationAction, StackActions } from "@react-navigation/native";
import { RootStackParamList } from "./rootStackTypes";

// Typed popTo requires all params of the target route, even with merge: true.
// When returning a value to an earlier screen only the returned fields are needed,
// they are merged onto the params that route already has.
export function popToWithMerge<
  RouteName extends keyof RootStackParamList & string,
>(
  navigation: { dispatch: (action: NavigationAction) => void },
  routeName: RouteName,
  params: Partial<NonNullable<RootStackParamList[RouteName]>>,
) {
  navigation.dispatch(StackActions.popTo(routeName, params, { merge: true }));
}
