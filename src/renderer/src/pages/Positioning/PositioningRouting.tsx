import { BeeTagTableRow } from "@components/Positioning/BeeTagTableRow";
import { Grid, Select, Table, TableBody, TableCell, TableHead, TableRow, MenuItem } from "@mui/material";
import { useBees, usePozyxData } from "@renderer/src/hooks";
import Yup from "@renderer/src/yup-ext";
import { IBee } from "@shared/interfaces";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";

type PositioningRoutingProps = {};

export const PositioningRouting = (props: PositioningRoutingProps) => {
  const [tags, setTags] = useState<string[]>([]);
  const { activeBees } = useBees();

  useEffect(() => {
    window.kweenb.methods.positioning.getAllTagIds().then((tags) => {
      setTags(tags);
    });
  }, [])

  if(activeBees.length === 0) return(<div>There are no active bees defined, please make some bees first!</div>)

  if(tags.length === 0) return(<div>We did not receive tags from the Pozyx MQTT broker.</div>)

  const handleOnTagChange = (bee: IBee, pozyxTagId: string) => {
    window.kweenb.actions.setBeePozyxTagId(bee, pozyxTagId);
  }

  return(
    <Formik
      initialValues={{
        pozyxMqttBroker: "mqtt://127.0.0.1:1883",
      }}
      validationSchema={Yup.object().shape({
        pozyxMqttBroker: Yup.string()
          .required("A Pozyx MQTT broker is required!")
          .matches(
            /^mqtt:\/\/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+/i,
            "The MQTT url is invalid (e.g. mqtt://127.0.0.1:1883)"
          ),
      })}
      onSubmit={async (values) => {
      }}
    >
      {() => (
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <Form>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: "75%" }}>Bee</TableCell>
                    <TableCell style={{ width: "25%" }} align="right">Tag ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeBees.map((activeBee) => (
                    <BeeTagTableRow
                      key={activeBee.id}
                      onTagChange={handleOnTagChange}
                      tags={tags}
                      bee={activeBee}
                      selected={activeBee.pozyxTagId}
                    />
                  ))}
                </TableBody>
              </Table>
            </Form>
          </Grid>
        </Grid>
      )}
    </Formik>
  );
};
