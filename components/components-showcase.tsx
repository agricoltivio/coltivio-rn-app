import { ScrollView, Text, View } from "react-native";
import { Card } from "./card/Card";
import { Body } from "@/theme/Typography";
import { Button } from "./buttons/Button";
import { ListItem } from "./list/ListItem";
import { TextInput } from "./inputs/TextInput";
import { Select } from "./select/Select";

export function ComponentsShowcase() {
  return (
    <ScrollView>
      <View
        style={{
          padding: 20,
          paddingTop: 100,
          // backgroundColor: "#2A5159",
          backgroundColor: "#EBF7FA",
          flex: 1,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          style={{
            marginVertical: 20,
            width: 400,
            height: 200,
          }}
        >
          <Card.Title>Heuernte</Card.Title>
          <Card.Content>
            <Body>Some Text</Body>
          </Card.Content>
        </Card>
        <Button type="primary" style={{ width: 200 }} title="foo" />
        <Button
          type="secondary"
          style={{
            width: 200,
            marginTop: 10,
            marginBottom: 10,
          }}
          title="foo"
        />
        <ListItem>
          <ListItem.Content>
            <ListItem.Title>TEst</ListItem.Title>
            <ListItem.Body>
              <Text>
                Subtitle aaaaaaa bbbbbb ddddd aaa sssddddddd aaaasss asdfasdf
              </Text>
            </ListItem.Body>
          </ListItem.Content>
        </ListItem>
        <ListItem
          onPress={() => {
            console.log("press");
          }}
        >
          <ListItem.Content style={{ paddingRight: 10 }}>
            <ListItem.Title>TEst</ListItem.Title>
            <ListItem.Body>
              Subtitle aaaaaaa bbbbbb ddddd aaa sssddddddd aaaassssssss asdfasdf
            </ListItem.Body>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
        <View style={{ marginTop: 20, width: 400, gap: 20 }}>
          <Select
            label="Maschine"
            data={[
              { label: "foo", value: "bar" },
              { label: "foo2", value: "bar2" },
            ]}
          />
          <TextInput label="Heumenge" error="blablabla" />
          <TextInput hideLabel placeholder="Heumenge" />
        </View>
      </View>
    </ScrollView>
  );
}
